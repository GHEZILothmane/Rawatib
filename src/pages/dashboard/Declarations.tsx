import { useState, useEffect } from 'react'
import { FileSpreadsheet, Download, Plus, CheckCircle, Clock, AlertTriangle, X, Send, Eye, TrendingUp, Users, DollarSign, BarChart3, Printer } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'

interface Declaration {
  id: number
  type: 'cnas' | 'cacobatph' | 'irg'
  period_month: number
  period_year: number
  total_employees: number
  total_salaire_brut: number
  total_cotisation_employee: number
  total_cotisation_employer: number
  total_cotisation: number
  status: 'draft' | 'submitted' | 'validated'
  submitted_at: string | null
  created_at: string
}

const months = [
  { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
]

const declarationTypes = [
  { value: 'cnas', label: 'CNAS', description: 'Caisse Nationale des Assurances Sociales' },
  { value: 'cacobatph', label: 'CACOBATPH', description: 'Caisse des Congés Payés du BTP' },
  { value: 'irg', label: 'IRG', description: 'Impôt sur le Revenu Global' }
]

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: Clock },
  submitted: { label: 'Soumise', color: 'bg-blue-100 text-blue-700', icon: Send },
  validated: { label: 'Validée', color: 'bg-green-100 text-green-700', icon: CheckCircle }
}

export function Declarations() {
  const [declarations, setDeclarations] = useState<Declaration[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [form, setForm] = useState({
    type: 'cnas' as 'cnas' | 'cacobatph' | 'irg',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear()
  })

  useEffect(() => { loadData() }, [])

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_URL}/declarations`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        setDeclarations(data.data || data || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = declarations.filter(d => d.period_year === selectedYear)

  const stats = {
    total: filtered.length,
    draft: filtered.filter(d => d.status === 'draft').length,
    submitted: filtered.filter(d => d.status === 'submitted').length,
    totalCotisation: filtered.reduce((sum, d) => sum + (d.total_cotisation || 0), 0)
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount)

  const openViewModal = (decl: Declaration) => {
    setSelectedDeclaration(decl)
    setShowViewModal(true)
  }

  // Statistiques avancées
  const totalMasseSalariale = filtered.reduce((sum, d) => sum + (d.total_salaire_brut || 0), 0)
  const totalEmployees = filtered.reduce((sum, d) => sum + (d.total_employees || 0), 0)
  const avgCotisationPerEmployee = totalEmployees > 0 ? (stats.totalCotisation / totalEmployees) : 0

  // Répartition par type
  const declarationsByType = declarationTypes.map(type => ({
    ...type,
    count: filtered.filter(d => d.type === type.value).length,
    total: filtered.filter(d => d.type === type.value).reduce((sum, d) => sum + (d.total_cotisation || 0), 0)
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/declarations/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form)
      })
      if (response.ok) {
        setShowModal(false)
        loadData()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la génération')
      }
    } catch { setError('Erreur de connexion au serveur') }
    finally { setSaving(false) }
  }

  const handleSubmitDeclaration = async (id: number) => {
    try {
      const token = getToken()
      await fetch(`${API_URL}/declarations/${id}/submit`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Déclarations Sociales</h1>
          <p className="text-slate-500">Gérez vos déclarations CNAS, CACOBATPH et IRG</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nouvelle déclaration
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Rappel des échéances</p>
          <p className="text-sm text-amber-700">Les déclarations CNAS doivent être soumises avant le 30 de chaque mois pour le mois précédent.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><FileSpreadsheet className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Déclarations</p><p className="text-2xl font-bold">{stats.total}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-gray-600" /></div>
          <div><p className="text-sm text-slate-500">Brouillons</p><p className="text-2xl font-bold text-gray-600">{stats.draft}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Soumises</p><p className="text-2xl font-bold text-green-600">{stats.submitted}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg"><Download className="w-6 h-6 text-purple-600" /></div>
          <div><p className="text-sm text-slate-500">Total cotisations</p><p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalCotisation)}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="font-semibold">Historique des déclarations</h2>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-3 py-2 border rounded-lg">
            {[2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Période</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Employés</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Masse salariale</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Cotisations</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Aucune déclaration pour cette année</td></tr>
              ) : (
                filtered.map((decl) => {
                  const StatusIcon = statusConfig[decl.status]?.icon || Clock
                  return (
                    <tr key={decl.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{declarationTypes.find(t => t.value === decl.type)?.label}</span>
                      </td>
                      <td className="px-4 py-3">{months.find(m => m.value === decl.period_month)?.label} {decl.period_year}</td>
                      <td className="px-4 py-3">{decl.total_employees}</td>
                      <td className="px-4 py-3">{formatCurrency(decl.total_salaire_brut)}</td>
                      <td className="px-4 py-3 font-bold text-blue-600">{formatCurrency(decl.total_cotisation)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[decl.status]?.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[decl.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openViewModal(decl)} className="p-2 hover:bg-slate-100 rounded-lg" title="Voir détails">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg" title="Télécharger"><Download className="w-4 h-4" /></button>
                          {decl.status === 'draft' && (
                            <button onClick={() => handleSubmitDeclaration(decl.id)} className="p-2 hover:bg-blue-100 rounded-lg" title="Soumettre">
                              <Send className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques avancées */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Récapitulatif Annuel {selectedYear}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-xl font-bold">{formatCurrency(totalMasseSalariale)}</p>
            <p className="text-xs opacity-80">Masse salariale</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-xl font-bold">{formatCurrency(stats.totalCotisation)}</p>
            <p className="text-xs opacity-80">Total cotisations</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{totalEmployees}</p>
            <p className="text-xs opacity-80">Employés déclarés</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <FileSpreadsheet className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{formatCurrency(avgCotisationPerEmployee)}</p>
            <p className="text-xs opacity-80">Moy. cotisation/emp.</p>
          </div>
        </div>
        
        {/* Répartition par type */}
        <div className="bg-white/10 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 opacity-90">Répartition par Type de Déclaration</h4>
          <div className="grid grid-cols-3 gap-4">
            {declarationsByType.map(type => (
              <div key={type.value} className="bg-white/10 rounded-lg p-3 text-center">
                <p className="font-bold text-lg">{type.count}</p>
                <p className="text-xs opacity-80">{type.label}</p>
                <p className="text-sm font-medium mt-1">{formatCurrency(type.total)}</p>
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
              <h2 className="text-lg font-semibold">Générer une déclaration</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de déclaration *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="w-full px-3 py-2 border rounded-lg">
                  {declarationTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label} - {t.description}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mois *</label>
                  <select value={form.period_month} onChange={(e) => setForm({ ...form, period_month: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg">
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année *</label>
                  <input type="number" value={form.period_year} onChange={(e) => setForm({ ...form, period_year: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Information</p>
                <p>La déclaration sera générée automatiquement à partir des bulletins de paie validés pour la période sélectionnée.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Génération...' : 'Générer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vue Détaillée */}
      {showViewModal && selectedDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Détails de la Déclaration</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* En-tête */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{declarationTypes.find(t => t.value === selectedDeclaration.type)?.label}</h3>
                    <p className="text-purple-200">{declarationTypes.find(t => t.value === selectedDeclaration.type)?.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {months.find(m => m.value === selectedDeclaration.period_month)?.label} {selectedDeclaration.period_year}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedDeclaration.status === 'validated' ? 'bg-green-500' : 
                        selectedDeclaration.status === 'submitted' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {statusConfig[selectedDeclaration.status]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-200 text-sm">Total Cotisations</p>
                    <p className="text-3xl font-bold">{formatCurrency(selectedDeclaration.total_cotisation)}</p>
                  </div>
                </div>
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600">Employés déclarés</p>
                  <p className="text-2xl font-bold text-blue-700">{selectedDeclaration.total_employees}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Masse salariale brute</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(selectedDeclaration.total_salaire_brut)}</p>
                </div>
              </div>

              {/* Détail des cotisations */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" /> Détail des Cotisations
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-600">Cotisation Employé (9%)</span>
                    <span className="font-medium text-orange-600">{formatCurrency(selectedDeclaration.total_cotisation_employee)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-600">Cotisation Employeur (26%)</span>
                    <span className="font-medium text-orange-600">{formatCurrency(selectedDeclaration.total_cotisation_employer)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-purple-100 px-3 rounded-lg">
                    <span className="font-semibold text-purple-800">Total à verser</span>
                    <span className="font-bold text-purple-800 text-lg">{formatCurrency(selectedDeclaration.total_cotisation)}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-500">Date de création</p>
                  <p className="font-medium">{new Date(selectedDeclaration.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {selectedDeclaration.submitted_at && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500">Date de soumission</p>
                    <p className="font-medium">{new Date(selectedDeclaration.submitted_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50">
                  <Printer className="w-4 h-4" /> Imprimer
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50">
                  <Download className="w-4 h-4" /> Télécharger PDF
                </button>
                {selectedDeclaration.status === 'draft' && (
                  <button 
                    onClick={() => { handleSubmitDeclaration(selectedDeclaration.id); setShowViewModal(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" /> Soumettre
                  </button>
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
