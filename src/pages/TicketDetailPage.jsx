import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketService } from '../services/ticketService'
import { commentService } from '../services/commentService'
import { useAuth } from '../hooks/useAuth'

const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED:    'bg-green-100 text-green-800',
  CLOSED:      'bg-gray-100 text-gray-700',
}

const PRIORITY_COLORS = {
  LOW:      'bg-gray-100 text-gray-600',
  MEDIUM:   'bg-orange-100 text-orange-700',
  HIGH:     'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-900',
}

const VALID_TRANSITIONS = {
  OPEN:        ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
}

const STATUS_LABELS = {
  OPEN:        'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED:    'Resuelto',
  CLOSED:      'Cerrado',
}

const STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingComment, setSavingComment] = useState(false)

  const fetchTicket = async () => {
    const { data } = await ticketService.getById(id)
    setTicket(data)
  }

  const fetchComments = async () => {
    const { data } = await commentService.getAll(id)
    setComments(data.results ?? data)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchTicket(), fetchComments()])
      setLoading(false)
    }
    load()
  }, [id])

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true)
    try {
      await ticketService.update(id, { status: newStatus })
      await fetchTicket()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingStatus(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSavingComment(true)
    try {
      await commentService.create(id, { content: newComment })
      setNewComment('')
      await fetchComments()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingComment(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-500">Cargando...</p>
    </div>
  )

  if (!ticket) return null

  const currentIdx = STEPS.indexOf(ticket.status)
  const nextStatuses = VALID_TRANSITIONS[ticket.status] ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Ticket Dashboard</h1>
        <button
          onClick={() => navigate('/tickets')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Volver a tickets
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Header ticket */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">#{ticket.id}</p>
              <h2 className="text-xl font-semibold text-gray-900">{ticket.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {ticket.created_by?.email} · {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[ticket.status]}`}>
                {STATUS_LABELS[ticket.status]}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
                {ticket.priority}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
        </div>

        {/* Máquina de estados */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Estado del ticket</h3>

          {/* Stepper */}
          <div className="flex items-center mb-6">
            {STEPS.map((s, i) => {
              const stepIdx = STEPS.indexOf(s)
              const done = stepIdx <= currentIdx
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mb-1 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <span className={`text-xs whitespace-nowrap ${done ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mb-4 ${stepIdx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Botones de transición */}
          {nextStatuses.length > 0 ? (
  <div className="flex gap-3">
    {nextStatuses
      .filter((s) => s !== 'CLOSED' || user?.role === 'ADMIN')
      .map((s) => (
        <button
          key={s}
          onClick={() => handleStatusChange(s)}
          disabled={savingStatus}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {savingStatus ? 'Guardando...' : `Mover a ${STATUS_LABELS[s]}`}
        </button>
      ))}
    {ticket.status === 'RESOLVED' && user?.role !== 'ADMIN' && (
      <p className="text-sm text-gray-400 self-center">
        Solo un administrador puede cerrar este ticket.
      </p>
    )}
  </div>
) : (
  <p className="text-sm text-gray-400">Este ticket está cerrado.</p>
)}
        </div>

        {/* Comentarios */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Comentarios ({comments.length})
          </h3>

          <div className="flex flex-col gap-4 mb-6">
            {comments.length === 0 && (
              <p className="text-sm text-gray-400">Sin comentarios aún.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-blue-700">
                    {c.author?.email?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{c.author?.email}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="flex gap-3">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={savingComment || !newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {savingComment ? 'Enviando...' : 'Comentar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}