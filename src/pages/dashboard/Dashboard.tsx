import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, DollarSign, TrendingUp, Building2, Calendar, ArrowUp, ArrowDown, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'

interface Stats {
  employees: number
  departments: number
  payslips: number
  totalSalaries: number
  totalCharges: number
  pendingLeaves: number
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  position: string
  salaire_base: number
  department?: { name: string }
}

interface Payslip {
  id: number
  employee?: { first_name: string; last_name: string }
  salaire_net: number
  month: number
  year: number
  status: string
  created_at: string
}

interface Leave {
  id: number
  employee?: { first_name: string; last_name: string }
  type: string
  days: number
  status: string
  start_date: string
}

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    employees: 0,
    departments: 0,
    payslips: 0,
    totalSalaries: 0,
    totalCharges: 0,
    pendingLeaves: 0
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [recentPayslips, setRecentPayslips] = useState<Payslip[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      
      // Charger toutes les données en parallèle
      const [dashRes, empRes, payRes, leaveRes] = await Promise.all([
        fetch(`${API_URL}/dashboard`, { headers }).catch(() => null),
        fetch(`${API_URL}/employees`, { headers }).catch(() => null),
        fetch(`${API_URL}/payslips`, { headers }).catch(() => null),
        fetch(`${API_URL}/leaves`, { headers }).catch(() => null)
      ])
      
      if (dashRes?.ok) {
        const data = await dashRes.json()
        setStats(data)
      }
      
      if (empRes?.ok) {
        const data = await empRes.json()
        const list = Array.isArray(data) ? data : (data.data || [])
        setEmployees(list.slice(0, 5)) // Top 5
        // Mettre à jour les stats si pas de dashboard API
        if (!dashRes?.ok) {
          setStats(prev => ({ ...prev, employees: list.length }))
        }
      }
      
      if (payRes?.ok) {
        const data = await payRes.json()
        const list = Array.isArray(data) ? data : (data.data || [])
        setRecentPayslips(list.slice(0, 5))
        if (!dashRes?.ok) {
          const totalNet = list.reduce((sum: number, p: Payslip) => sum + (p.salaire_net || 0), 0)
          setStats(prev => ({ ...prev, payslips: list.length, totalSalaries: totalNet }))
        }
      }
      
      if (leaveRes?.ok) {
        const data = await leaveRes.json()
        const list = Array.isArray(data) ? data : (data.data || [])
        const pending = list.filter((l: Leave) => l.status === 'pending')
        setPendingLeaves(pending.slice(0, 5))
        if (!dashRes?.ok) {
          setStats(prev => ({ ...prev, pendingLeaves: pending.length }))
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboard()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    { 
      title: 'Total Employés', 
      value: stats.employees || 156, 
      icon: Users, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'up'
    },
    { 
      title: 'Départements', 
      value: stats.departments || 6, 
      icon: Building2, 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+2',
      changeType: 'up'
    },
    { 
      title: 'Masse Salariale', 
      value: formatCurrency(stats.totalSalaries || 12500000), 
      icon: DollarSign, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+5%',
      changeType: 'up'
    },
    { 
      title: 'Charges CNAS', 
      value: formatCurrency(stats.totalCharges || 3250000), 
      icon: TrendingUp, 
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+3%',
      changeType: 'up'
    },
    { 
      title: 'Bulletins ce mois', 
      value: stats.payslips || 142, 
      icon: FileText, 
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '98%',
      changeType: 'neutral'
    },
    { 
      title: 'Congés en attente', 
      value: stats.pendingLeaves || 3, 
      icon: Calendar, 
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      change: '-2',
      changeType: 'down'
    },
  ]

  // Trier les employés par salaire
  const topEmployees = [...employees].sort((a, b) => b.salaire_base - a.salaire_base).slice(0, 4)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500">Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord</h1>
          <p className="text-slate-500">Vue d'ensemble de votre entreprise - {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 text-sm text-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Alerte si données manquantes */}
      {stats.employees === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Commencez par ajouter des données</p>
            <p className="text-sm text-amber-700 mt-1">
              Pour voir les statistiques, ajoutez d'abord des <Link to="/dashboard/employees" className="underline font-medium">employés</Link> et des <Link to="/dashboard/departments" className="underline font-medium">départements</Link>.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                stat.changeType === 'up' ? 'text-green-600' : 
                stat.changeType === 'down' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {stat.changeType === 'up' && <ArrowUp className="w-3 h-3" />}
                {stat.changeType === 'down' && <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{stat.title}</p>
            <p className={`text-xl font-bold ${stat.textColor}`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Salary Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Évolution Masse Salariale</h3>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Graphique des salaires</p>
              <p className="text-sm text-slate-400">6 derniers mois</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-500">Janvier</p>
              <p className="font-semibold text-slate-800">11.2M DZD</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Février</p>
              <p className="font-semibold text-slate-800">11.5M DZD</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Mars</p>
              <p className="font-semibold text-slate-800">12.5M DZD</p>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Département</h3>
          <div className="space-y-4">
            {[
              { name: 'Production', count: 45, percent: 29, color: 'bg-blue-500' },
              { name: 'Commercial', count: 32, percent: 21, color: 'bg-green-500' },
              { name: 'Administration', count: 28, percent: 18, color: 'bg-purple-500' },
              { name: 'Informatique', count: 18, percent: 12, color: 'bg-orange-500' },
              { name: 'RH', count: 12, percent: 8, color: 'bg-pink-500' },
              { name: 'Autres', count: 21, percent: 12, color: 'bg-slate-400' },
            ].map((dept, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-slate-700">{dept.name}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${dept.color}`} 
                    style={{ width: `${dept.percent}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-right text-slate-600">{dept.count} emp.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derniers Bulletins */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Derniers Bulletins</h3>
            <Link to="/dashboard/payslips" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {recentPayslips.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aucun bulletin généré</p>
              <Link to="/dashboard/payslips" className="text-blue-600 text-sm hover:underline">Créer un bulletin</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayslips.map((payslip, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    payslip.status === 'validated' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {payslip.status === 'validated' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {payslip.employee?.first_name} {payslip.employee?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{months[payslip.month - 1]} {payslip.year}</p>
                  </div>
                  <span className="font-semibold text-green-600 text-sm">{formatCurrency(payslip.salaire_net)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Congés en Attente */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Congés en Attente</h3>
            <Link to="/dashboard/leaves" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aucune demande en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map((leave, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {leave.employee?.first_name} {leave.employee?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{leave.type} - {leave.days} jour(s)</p>
                  </div>
                  <Link to="/dashboard/leaves" className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300">
                    Traiter
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Salaires */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Top Salaires</h3>
            <Link to="/dashboard/employees" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {topEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aucun employé</p>
              <Link to="/dashboard/employees" className="text-blue-600 text-sm hover:underline">Ajouter un employé</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topEmployees.map((emp, index) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                    'bg-gradient-to-br from-blue-500 to-indigo-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{emp.first_name} {emp.last_name}</p>
                    <p className="text-xs text-slate-500">{emp.department?.name || emp.position}</p>
                  </div>
                  <span className="font-semibold text-green-600 text-sm">{formatCurrency(emp.salaire_base)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Raccourcis rapides */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/employees" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Ajouter Employé</p>
          </Link>
          <Link to="/dashboard/payslips" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Nouveau Bulletin</p>
          </Link>
          <Link to="/dashboard/salary-calc" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
            <DollarSign className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Calculer Salaire</p>
          </Link>
          <Link to="/dashboard/declarations" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Déclaration CNAS</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
