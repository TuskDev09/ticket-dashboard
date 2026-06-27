import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('refresh_token', data.refresh)
    setAuth(data.access)
    navigate('/tickets')
  }

  const logout = () => {
    localStorage.removeItem('refresh_token')
    clearAuth()
    navigate('/login')
  }

  return { user, isAuthenticated, login, logout }
}