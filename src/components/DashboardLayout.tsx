import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  Building2,
  Calculator,
  FileSpreadsheet,
  Clock,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
  { icon: Users, label: 'Employés', path: '/dashboard/employees' },
  { icon: Building2, label: 'Départements', path: '/dashboard/departments' },
  { icon: FileText, label: 'Bulletins de paie', path: '/dashboard/payslips' },
  { icon: Calculator, label: 'Calcul salaires', path: '/dashboard/salary-calc' },
  { icon: Calendar, label: 'Congés', path: '/dashboard/leaves' },
  { icon: Clock, label: 'Pointage', path: '/dashboard/attendance' },
  { icon: FileSpreadsheet, label: 'Déclarations CNAS', path: '/dashboard/declarations' },
  { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      navigate('/login')
      return
    }
    
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        setUser({ name: 'Utilisateur', email: '', role: 'user' })
      }
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-400">RAWATIB</span>
              <p className="text-xs text-slate-400">Gestion des Salaires</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-red-600 hover:text-white w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block">
                <h2 className="font-semibold text-slate-800">
                  Bienvenue, {user?.name || 'Utilisateur'}
                </h2>
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('fr-DZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-slate-800">{user?.name}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                      </div>
                      <Link to="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50">
                        <User className="w-4 h-4" />
                        Profil
                      </Link>
                      <Link to="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50">
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
