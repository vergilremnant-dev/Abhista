import { useNavigate } from 'react-router-dom'
import { useAuthDispatch } from '../../hooks/auth/useAuthStore'
import { logoutThunk } from '../../store/auth/authSlice'

export function LogoutButton() {
  const dispatch = useAuthDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logoutThunk())
    navigate('/login', { replace: true })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
    >
      Logout
    </button>
  )
}
