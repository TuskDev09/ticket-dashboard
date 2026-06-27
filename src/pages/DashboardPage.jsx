import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketService } from '../services/ticketService'
import { useAuth } from '../hooks/useAuth'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const STATUS_LABELS = {
  OPEN:        'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED:    'Resuelto',
  CLOSED:      'Cerrado',
}

const PRIORITY_LABELS = {
  LOW:      'Baja',
  MEDIUM:   'Media',
  HIGH:     'Alta',
  CRITICAL: 'Crítica',
}

const STATUS_COLORS  = ['#3b82f6', '#f59e0b', '#22c55e', '#6b7280']
const PRIORITY_COLORS = ['#6b7280', '#f97316', '#ef4444', '#991b1b']

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await ticketService.getAll({ page_size: 100 })
        setTickets(data.results ?? data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const countBy = (key, labels) =>
    Object.entries(labels).map(([value, name]) => ({
      name,
      value: tickets.filter((t) => t[key] === value).length,
    }))

  const statusData   = countBy('status', STATUS_LABELS)
  const priorityData = countBy('priority', PRIORITY_LABELS)

  const total    = tickets.length
  const open     = tickets.filter((t) => t.status === 'OPEN').length
  const progress = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolved = tickets.filter((t) => t.status === 'RESOLVED').length

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-500">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Ticket Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.role}</span>
          <button
            onClick={() => navigate('/tickets')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Tickets
          </button>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',       value: total,    color: 'text-gray-900' },
            { label: 'Abiertos',    value: open,     color: 'text-blue-600' },
            { label: 'En progreso', value: progress, color: 'text-yellow-600' },
            { label: 'Resueltos',   value: resolved, color: 'text-green-600' },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500 mb-1">{m.label}</p>
              <p className={`text-3xl font-semibold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bar chart — por estado */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Tickets por estado</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — por prioridad */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Tickets por prioridad</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {priorityData.map((_, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  )
}