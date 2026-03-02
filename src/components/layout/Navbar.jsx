import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast.success('Déconnexion réussie')
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
          <BookOpen size={24} />
          ELearn
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="btn-secondary text-sm">Connexion</Link>
              <Link to="/register" className="btn-primary text-sm">S'inscrire</Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Cours
              </Link>
              {profile?.role === 'teacher' && (
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium">
                  <LayoutDashboard size={16} />
                  Tableau de bord
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={16} className="text-primary-600" />
                  )}
                </div>
                <span className="hidden sm:block font-medium">{profile?.full_name}</span>
              </Link>
              <button onClick={handleSignOut} className="text-gray-400 hover:text-gray-600">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
