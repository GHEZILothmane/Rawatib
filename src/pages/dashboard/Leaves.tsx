import { useState, useEffect } from 'react'
import { Calendar, Plus, Check, X, Clock, User, Filter, Eye, CalendarDays, FileText, AlertCircle, TrendingUp, Users } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'

interface Leave {
  id: number
  employee_id: number
  employee?: { first_name: string; last_name: string }
  type: 'annual' | 'sick' | 'maternity' | 'unpaid' | 'other'
  start_date: string
  end_date: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
}

const leaveTypes = [
  { value: 'annual', label: 'Congé annuel', color: 'bg-blue-100 text-blue-700' },
  { value: 'sick', label: 'Congé maladie', color: 'bg-red-100 text-red-700' },
  { value: 'maternity', label: 'Congé maternité', color: 'bg-pink-100 text-pink-700' },
  { value: 'unpaid', label: 'Congé sans solde', color: 'bg-gray-100 text-gray-700' },
  { value: 'other', label: 'Autre', color: 'bg-purple-100 text-purple-700' }
]

const statusLabels = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' }
}

export function Leaves() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [form, setForm] = useState({
    employee_id: 0,
    type: 'annual' as const,
    start_date: '',
    end_date: '',
    reason: ''
  })

  useEffect(() => { loadData() }, [])

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const [leavesRes, empRes] = await Promise.all([
        fetch(`${API_URL}/leaves`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
        fetch(`${API_URL}/employees`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
      ])
      if (leavesRes.ok) {
        const data = await leavesRes.json()
        setLeaves(data.data || data || [])
      }
      if (empRes.ok) {
        const data = await empRes.json()
        setEmployees(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = filterStatus === 'all' ? leaves : leaves.filter(l => l.status === filterStatus)

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const token = getToken()
      const days = calculateDays(form.start_date, form.end_date)
      const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...form, days })
      })
      if (response.ok) {
        setShowModal(false)
        setForm({ employee_id: 0, type: 'annual', start_date: '', end_date: '', reason: '' })
        loadData()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création')
      }
    } catch { setError('Erreur de connexion au serveur') }
    finally { setSaving(false) }
  }

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const token = getToken()
      await fetch(`${API_URL}/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status })
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatDateLong = (date: string) => new Date(date).toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const openViewModal = (leave: Leave) => {
    setSelectedLeave(leave)
    setShowViewModal(true)
  }

  // Statistiques avancées
  const totalDaysRequested = leaves.reduce((sum, l) => sum + (l.days || 0), 0)
  const totalDaysApproved = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + (l.days || 0), 0)
  const approvalRate = leaves.length > 0 ? (stats.approved / leaves.length * 100) : 0
  const avgDaysPerRequest = leaves.length > 0 ? (totalDaysRequested / leaves.length) : 0

  // Répartition par type
  const leavesByType = leaveTypes.map(type => ({
    ...type,
    count: leaves.filter(l => l.type === type.value).length,
    days: leaves.filter(l => l.type === type.value).reduce((sum, l) => sum + (l.days || 0), 0)
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Congés</h1>
          <p className="text-slate-500">Gérez les demandes de congés des employés</p>
        </div>
        <button onClick={() => { setForm({ employee_id: employees[0]?.id || 0, type: 'annual', start_date: '', end_date: '', reason: '' }); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nouvelle demande
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Calendar className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
          <div><p className="text-sm text-slate-500">En attente</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><Check className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Approuvés</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg"><X className="w-6 h-6 text-red-600" /></div>
          <div><p className="text-sm text-slate-500">Refusés</p><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="font-semibold">Demandes de congés</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Refusés</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Employé</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Période</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Jours</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Motif</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Aucune demande de congé</td></tr>
              ) : (
                filtered.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-medium">{leave.employee?.first_name} {leave.employee?.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${leaveTypes.find(t => t.value === leave.type)?.color}`}>
                        {leaveTypes.find(t => t.value === leave.type)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(leave.start_date)} - {formatDate(leave.end_date)}</td>
                    <td className="px-4 py-3 font-medium">{leave.days} j</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{leave.reason || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[leave.status].color}`}>
                        {statusLabels[leave.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openViewModal(leave)} className="p-2 hover:bg-slate-100 rounded-lg" title="Voir détails">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        {leave.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusChange(leave.id, 'approved')} className="p-2 hover:bg-green-100 rounded-lg" title="Approuver">
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button onClick={() => handleStatusChange(leave.id, 'rejected')} className="p-2 hover:bg-red-100 rounded-lg" title="Refuser">
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques avancées */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Statistiques des Congés
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <CalendarDays className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{totalDaysRequested}</p>
            <p className="text-xs opacity-80">Jours demandés</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <Check className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{totalDaysApproved}</p>
            <p className="text-xs opacity-80">Jours approuvés</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{approvalRate.toFixed(0)}%</p>
            <p className="text-xs opacity-80">Taux d'approbation</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{avgDaysPerRequest.toFixed(1)}</p>
            <p className="text-xs opacity-80">Moy. jours/demande</p>
          </div>
        </div>
        
        {/* Répartition par type */}
        <div className="bg-white/10 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 opacity-90">Répartition par Type</h4>
          <div className="space-y-2">
            {leavesByType.filter(t => t.count > 0).map(type => (
              <div key={type.value} className="flex items-center gap-3">
                <span className="w-28 text-sm truncate">{type.label}</span>
                <div className="flex-1 bg-white/20 rounded-full h-3">
                  <div className="bg-white h-3 rounded-full" style={{ width: `${leaves.length > 0 ? (type.count / leaves.length * 100) : 0}%` }}></div>
                </div>
                <span className="w-16 text-right text-sm">{type.count} ({type.days}j)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nouvelle demande de congé</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employé *</label>
                <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Sélectionner un employé</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de congé *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="w-full px-3 py-2 border rounded-lg">
                  {leaveTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date début *</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date fin *</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              {form.start_date && form.end_date && (
                <p className="text-sm text-blue-600">Durée: {calculateDays(form.start_date, form.end_date)} jour(s)</p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motif</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Raison de la demande..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Envoi...' : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vue Détaillée */}
      {showViewModal && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Détails de la Demande</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* En-tête employé */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedLeave.employee?.first_name?.charAt(0)}{selectedLeave.employee?.last_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedLeave.employee?.first_name} {selectedLeave.employee?.last_name}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedLeave.status === 'approved' ? 'bg-green-500' : 
                      selectedLeave.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {statusLabels[selectedLeave.status].label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-green-200 text-sm">Durée</p>
                    <p className="text-3xl font-bold">{selectedLeave.days}j</p>
                  </div>
                </div>
              </div>

              {/* Type de congé */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Type de congé</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${leaveTypes.find(t => t.value === selectedLeave.type)?.color}`}>
                      {leaveTypes.find(t => t.value === selectedLeave.type)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Période */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Date de début</p>
                  <p className="font-bold text-green-700">{formatDateLong(selectedLeave.start_date)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Date de fin</p>
                  <p className="font-bold text-red-700">{formatDateLong(selectedLeave.end_date)}</p>
                </div>
              </div>

              {/* Motif */}
              {selectedLeave.reason && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Motif de la demande
                  </p>
                  <p className="text-slate-600">{selectedLeave.reason}</p>
                </div>
              )}

              {/* Date de création */}
              <div className="text-sm text-slate-500 text-center">
                Demande créée le {new Date(selectedLeave.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {selectedLeave.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => { handleStatusChange(selectedLeave.id, 'approved'); setShowViewModal(false); }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" /> Approuver
                    </button>
                    <button 
                      onClick={() => { handleStatusChange(selectedLeave.id, 'rejected'); setShowViewModal(false); }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" /> Refuser
                    </button>
                  </>
                )}
                <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
