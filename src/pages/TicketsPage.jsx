import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketService } from '../services/ticketService'
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

export default function TicketsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)   params.search   = search
      if (status)   params.status   = status
      if (priority) params.priority = priority
      const { data } = await ticketService.getAll(params)
      setTickets(data.results ?? data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [status, priority])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTickets()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Ticket Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.role}</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </button>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Tickets</h2>
          <button
            onClick={() => navigate('/tickets/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo ticket
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abierto</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="RESOLVED">Resuelto</option>
            <option value="CLOSED">Cerrado</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-500">No hay tickets.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      #{t.id} · {t.created_by?.email ?? 'Sin asignar'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[t.status]}`}>
                      {t.status}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}