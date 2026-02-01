import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Building2, Users, Search, Eye, X, TrendingUp, BarChart3, UserCheck } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'

interface Department {
  id: number
  name: string
  description: string | null
  employees_count?: number
  total_salaire?: number
  employees?: Array<{ id: number; first_name: string; last_name: string; position: string; salaire_base: number }>
}

export function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '' })

  useEffect(() => { loadData() }, [])

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_URL}/departments`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        setDepartments(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  )

  const totalEmployees = departments.reduce((sum, d) => sum + (d.employees_count || 0), 0)

  const resetForm = () => {
    setForm({ name: '', description: '' })
    setSelectedDept(null)
    setError('')
  }

  const openCreate = () => { resetForm(); setShowModal(true) }
  const openEdit = (dept: Department) => {
    setSelectedDept(dept)
    setForm({ name: dept.name, description: dept.description || '' })
    setShowModal(true)
  }
  const openDelete = (dept: Department) => { setSelectedDept(dept); setShowDeleteModal(true) }
  const openView = (dept: Department) => { setSelectedDept(dept); setShowViewModal(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Le nom est obligatoire'); return }
    setError('')
    setSaving(true)

    try {
      const token = getToken()
      const url = selectedDept ? `${API_URL}/departments/${selectedDept.id}` : `${API_URL}/departments`
      const response = await fetch(url, {
        method: selectedDept ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setShowModal(false)
        resetForm()
        loadData()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedDept) return
    setSaving(true)
    try {
      const token = getToken()
      await fetch(`${API_URL}/departments/${selectedDept.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      setShowDeleteModal(false)
      setSelectedDept(null)
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Départements</h1>
          <p className="text-slate-500">Gérez les départements de votre entreprise</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nouveau Département
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Building2 className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Total Départements</p><p className="text-2xl font-bold text-blue-600">{departments.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><Users className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Total Employés</p><p className="text-2xl font-bold text-green-600">{totalEmployees}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-slate-500">Moyenne par Département</p>
          <p className="text-2xl font-bold text-purple-600">{departments.length ? Math.round(totalEmployees / departments.length) : 0} emp.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-slate-500">Plus grand département</p>
          <p className="text-lg font-bold text-orange-600 truncate">
            {departments.length > 0 ? departments.reduce((max, d) => (d.employees_count || 0) > (max.employees_count || 0) ? d : max, departments[0]).name : '-'}
          </p>
        </div>
      </div>

      {/* Statistiques avancées */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Répartition des Effectifs
        </h3>
        <div className="space-y-3">
          {departments.slice(0, 5).map((dept, index) => (
            <div key={dept.id} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
              <span className="w-32 text-sm truncate">{dept.name}</span>
              <div className="flex-1 bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all" 
                  style={{ width: `${totalEmployees > 0 ? ((dept.employees_count || 0) / totalEmployees * 100) : 0}%` }}
                ></div>
              </div>
              <span className="w-20 text-right text-sm">{dept.employees_count || 0} emp.</span>
            </div>
          ))}
        </div>
        {departments.length === 0 && (
          <p className="text-center text-white/70 py-4">Aucun département créé</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <span className="text-sm text-slate-500">{filtered.length} département(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Description</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Employés</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">Aucun département</td></tr>
              ) : (
                filtered.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">#{dept.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded"><Building2 className="w-4 h-4 text-blue-600" /></div>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{dept.description || <span className="italic text-slate-400">Aucune</span>}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{dept.employees_count || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openView(dept)} className="p-2 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-500" /></button>
                        <button onClick={() => openEdit(dept)} className="p-2 hover:bg-slate-100 rounded-lg"><Edit className="w-4 h-4 text-blue-600" /></button>
                        <button onClick={() => openDelete(dept)} className="p-2 hover:bg-slate-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedDept ? 'Modifier' : 'Nouveau'} Département</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal - Détaillé */}
      {showViewModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Détails du Département</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* En-tête */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedDept.name}</h3>
                    <p className="text-blue-200">ID: #{selectedDept.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-sm">Employés</p>
                    <p className="text-3xl font-bold">{selectedDept.employees_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Effectif</p>
                  <p className="text-2xl font-bold text-green-700">{selectedDept.employees_count || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <UserCheck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-600">Statut</p>
                  <p className="text-xl font-bold text-purple-700">Actif</p>
                </div>
              </div>

              {/* Part de l'effectif */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Part de l'effectif total
                  </span>
                  <span className="font-bold text-blue-600">
                    {totalEmployees > 0 ? ((selectedDept.employees_count || 0) / totalEmployees * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all" 
                    style={{ width: `${totalEmployees > 0 ? ((selectedDept.employees_count || 0) / totalEmployees * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
                <p className="text-slate-600">
                  {selectedDept.description || <span className="italic text-slate-400">Aucune description disponible</span>}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  onClick={() => { setShowViewModal(false); openEdit(selectedDept); }}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Supprimer le département</h2>
            <p className="text-slate-600 mb-2">Voulez-vous vraiment supprimer "{selectedDept.name}" ?</p>
            {(selectedDept.employees_count || 0) > 0 && (
              <p className="text-orange-600 bg-orange-50 p-2 rounded text-sm mb-4">⚠️ Ce département contient {selectedDept.employees_count} employé(s).</p>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
              <button onClick={handleDelete} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
