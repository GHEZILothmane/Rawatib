import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Users, UserCheck, UserX, X, Camera, CreditCard, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000/api'
const STORAGE_URL = 'http://localhost:8000/storage'

interface Employee {
  id: number
  matricule: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  position: string
  department_id: number
  department?: { id: number; name: string }
  salaire_base: number
  status: 'active' | 'inactive' | 'suspended'
  date_of_birth: string
  hire_date: string
  // Nouveaux champs bancaires
  rip?: string | null
  ccp_number?: string | null
  bank_account?: string | null
  bank_name?: string | null
  bank_agency?: string | null
  payment_method?: 'virement' | 'cheque' | 'ccp' | 'especes'
  // Photo
  photo?: string | null
}

interface Department {
  id: number
  name: string
}

export function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [payslipSuccess, setPayslipSuccess] = useState('')

  const [form, setForm] = useState({
    matricule: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    hire_date: '',
    position: '',
    department_id: 0,
    salaire_base: 0,
    // Champs bancaires
    rip: '',
    ccp_number: '',
    bank_account: '',
    bank_name: '',
    bank_agency: '',
    payment_method: 'virement' as 'virement' | 'cheque' | 'ccp' | 'especes',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      const [empRes, deptRes] = await Promise.all([
        fetch(`${API_URL}/employees`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${API_URL}/departments`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
      ])

      if (empRes.ok) {
        const empData = await empRes.json()
        setEmployees(Array.isArray(empData) ? empData : (empData.data || []))
      }
      
      if (deptRes.ok) {
        const deptData = await deptRes.json()
        setDepartments(Array.isArray(deptData) ? deptData : [])
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = employees.filter(e =>
    e.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status !== 'active').length,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const resetForm = () => {
    setForm({
      matricule: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      hire_date: '',
      position: '',
      department_id: departments[0]?.id || 0,
      salaire_base: 0,
      rip: '',
      ccp_number: '',
      bank_account: '',
      bank_name: '',
      bank_agency: '',
      payment_method: 'virement',
    })
    setSelectedEmployee(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    setError('')
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp)
    setForm({
      matricule: emp.matricule,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      date_of_birth: emp.date_of_birth,
      hire_date: emp.hire_date,
      position: emp.position,
      department_id: emp.department_id,
      salaire_base: emp.salaire_base,
      rip: emp.rip || '',
      ccp_number: emp.ccp_number || '',
      bank_account: emp.bank_account || '',
      bank_name: emp.bank_name || '',
      bank_agency: emp.bank_agency || '',
      payment_method: (emp.payment_method || 'virement') as 'virement' | 'cheque' | 'ccp' | 'especes',
    })
    setPhotoPreview(emp.photo ? `${STORAGE_URL}/${emp.photo}` : null)
    setShowModal(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openView = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowViewModal(true)
  }

  const openDelete = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowDeleteModal(true)
  }

  const openPayslip = (emp: Employee) => {
    setSelectedEmployee(emp)
    setPayslipForm({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      prime_transport: 0,
      prime_rendement: 0,
      heures_supp: 0,
      retenues: 0
    })
    setPayslipSuccess('')
    setShowPayslipModal(true)
  }

  const [payslipForm, setPayslipForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    prime_transport: 0,
    prime_rendement: 0,
    heures_supp: 0,
    retenues: 0
  })

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ]

  const handleCreatePayslip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return
    
    setError('')
    setSaving(true)
    setPayslipSuccess('')

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/payslips/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          ...payslipForm
        })
      })

      if (response.ok) {
        setPayslipSuccess(`✅ Bulletin de paie créé avec succès pour ${selectedEmployee.first_name} ${selectedEmployee.last_name}!`)
        setTimeout(() => {
          setShowPayslipModal(false)
          setPayslipSuccess('')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création du bulletin')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const token = getToken()
      const url = selectedEmployee 
        ? `${API_URL}/employees/${selectedEmployee.id}`
        : `${API_URL}/employees`
      
      // Utiliser FormData si on a une photo
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value))
        }
      })
      
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      // Pour PUT avec FormData, on utilise POST avec _method
      const method = selectedEmployee ? 'POST' : 'POST'
      if (selectedEmployee) {
        formData.append('_method', 'PUT')
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      })

      if (response.ok) {
        // Si on a une photo et c'est une mise à jour, uploader séparément
        if (photoFile && selectedEmployee) {
          const photoFormData = new FormData()
          photoFormData.append('photo', photoFile)
          await fetch(`${API_URL}/employees/${selectedEmployee.id}/photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body: photoFormData
          })
        }
        setShowModal(false)
        resetForm()
        loadData()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEmployee) return
    setSaving(true)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setSelectedEmployee(null)
        loadData()
      }
    } catch (err) {
      console.error('Error deleting:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Employés</h1>
          <p className="text-slate-500">Gérez les employés de votre entreprise</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nouvel Employé
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Inactifs</p>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-sm text-slate-500">{filtered.length} employé(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Matricule</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Nom Complet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Poste</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Département</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Salaire</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-slate-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm">{emp.matricule}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {emp.photo ? (
                          <img 
                            src={`${STORAGE_URL}/${emp.photo}`} 
                            alt={`${emp.first_name} ${emp.last_name}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.position}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.department?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(emp.salaire_base)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openView(emp)} className="p-2 hover:bg-slate-100 rounded-lg" title="Voir">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => openPayslip(emp)} className="p-2 hover:bg-green-100 rounded-lg" title="Créer bulletin de paie">
                          <Receipt className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={() => openEdit(emp)} className="p-2 hover:bg-slate-100 rounded-lg" title="Modifier">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button onClick={() => openDelete(emp)} className="p-2 hover:bg-slate-100 rounded-lg" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedEmployee ? 'Modifier' : 'Nouvel'} Employé</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              {/* Photo de l'employé */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {form.first_name?.charAt(0) || '?'}{form.last_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {photoFile && (
                <p className="text-center text-sm text-green-600">📷 Nouvelle photo sélectionnée: {photoFile.name}</p>
              )}

              {/* Informations personnelles */}
              <div className="border-b pb-2 mb-2">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Informations Personnelles
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Matricule *</label>
                  <input
                    type="text"
                    value={form.matricule}
                    onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="border-b pb-2 mb-2 mt-4">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Informations Professionnelles
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date d'embauche *</label>
                  <input
                    type="date"
                    value={form.hire_date}
                    onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Poste *</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Département *</label>
                  <select
                    value={form.department_id}
                    onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salaire Base (DZD) *</label>
                  <input
                    type="number"
                    value={form.salaire_base}
                    onChange={(e) => setForm({ ...form, salaire_base: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Informations bancaires */}
              <div className="border-b pb-2 mb-2 mt-4">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Informations Bancaires
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode de paiement</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value as 'virement' | 'cheque' | 'ccp' | 'especes' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="virement">Virement bancaire</option>
                    <option value="cheque">Chèque</option>
                    <option value="ccp">CCP</option>
                    <option value="especes">Espèces</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">N° RIP (20 chiffres)</label>
                  <input
                    type="text"
                    value={form.rip}
                    onChange={(e) => setForm({ ...form, rip: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="00799999000300012345"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">N° CCP</label>
                  <input
                    type="text"
                    value={form.ccp_number}
                    onChange={(e) => setForm({ ...form, ccp_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567 clé 89"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">N° Compte bancaire</label>
                  <input
                    type="text"
                    value={form.bank_account}
                    onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Numéro de compte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la banque</label>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: BNA, CPA, BEA..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agence</label>
                  <input
                    type="text"
                    value={form.bank_agency}
                    onChange={(e) => setForm({ ...form, bank_agency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Agence de..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Fiche Employé</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* En-tête avec photo */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-4">
                  {selectedEmployee.photo ? (
                    <img 
                      src={`${STORAGE_URL}/${selectedEmployee.photo}`}
                      alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                      {selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
                    <p className="text-blue-200">{selectedEmployee.position}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">{selectedEmployee.matricule}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${selectedEmployee.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {selectedEmployee.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-sm">Salaire de Base</p>
                    <p className="text-3xl font-bold">{formatCurrency(selectedEmployee.salaire_base)}</p>
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Informations Personnelles
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Email</span>
                      <span className="font-medium text-sm">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Téléphone</span>
                      <span className="font-medium text-sm">{selectedEmployee.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Date de naissance</span>
                      <span className="font-medium text-sm">
                        {selectedEmployee.date_of_birth ? new Date(selectedEmployee.date_of_birth).toLocaleDateString('fr-DZ') : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Informations Professionnelles
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Département</span>
                      <span className="font-medium text-sm">{selectedEmployee.department?.name || 'Non assigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Date d'embauche</span>
                      <span className="font-medium text-sm">
                        {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString('fr-DZ') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Ancienneté</span>
                      <span className="font-medium text-sm">
                        {selectedEmployee.hire_date ? 
                          `${Math.floor((new Date().getTime() - new Date(selectedEmployee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} an(s)` 
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations salariales */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-3">Informations Salariales</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedEmployee.salaire_base)}</p>
                    <p className="text-sm text-green-600">Salaire Brut</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedEmployee.salaire_base * 0.09)}</p>
                    <p className="text-sm text-orange-600">CNAS (9%)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedEmployee.salaire_base * 0.91)}</p>
                    <p className="text-sm text-blue-600">Net Estimé</p>
                  </div>
                </div>
              </div>

              {/* Informations bancaires */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Informations Bancaires
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Mode de paiement</span>
                      <span className="font-medium text-sm capitalize">
                        {selectedEmployee.payment_method === 'virement' ? '🏦 Virement' :
                         selectedEmployee.payment_method === 'cheque' ? '📝 Chèque' :
                         selectedEmployee.payment_method === 'ccp' ? '📮 CCP' :
                         selectedEmployee.payment_method === 'especes' ? '💵 Espèces' : 'Non défini'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">N° RIP</span>
                      <span className="font-medium text-sm font-mono">{selectedEmployee.rip || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">N° CCP</span>
                      <span className="font-medium text-sm font-mono">{selectedEmployee.ccp_number || 'Non renseigné'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Compte bancaire</span>
                      <span className="font-medium text-sm font-mono">{selectedEmployee.bank_account || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Banque</span>
                      <span className="font-medium text-sm">{selectedEmployee.bank_name || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Agence</span>
                      <span className="font-medium text-sm">{selectedEmployee.bank_agency || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <button onClick={() => { setShowViewModal(false); openPayslip(selectedEmployee); }} 
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Receipt className="w-4 h-4" /> Créer bulletin de paie
                </button>
                <div className="flex gap-3">
                  <button onClick={() => { setShowViewModal(false); openEdit(selectedEmployee); }} 
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50">
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                  <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Supprimer l'employé</h2>
            <p className="text-slate-600 mb-6">
              Voulez-vous vraiment désactiver {selectedEmployee.first_name} {selectedEmployee.last_name} ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Payslip Modal */}
      {showPayslipModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPayslipModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Créer un Bulletin de Paie</h2>
              <button onClick={() => setShowPayslipModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePayslip} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              {payslipSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">{payslipSuccess}</div>}
              
              {/* Info employé */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  {selectedEmployee.photo ? (
                    <img 
                      src={`${STORAGE_URL}/${selectedEmployee.photo}`}
                      alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                      {selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
                    <p className="text-blue-200 text-sm">{selectedEmployee.position}</p>
                    <p className="text-blue-100 text-xs">Matricule: {selectedEmployee.matricule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-xs">Salaire de base</p>
                    <p className="text-xl font-bold">{formatCurrency(selectedEmployee.salaire_base)}</p>
                  </div>
                </div>
              </div>

              {/* Période */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mois *</label>
                  <select 
                    value={payslipForm.month} 
                    onChange={(e) => setPayslipForm({ ...payslipForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année *</label>
                  <input 
                    type="number" 
                    value={payslipForm.year} 
                    onChange={(e) => setPayslipForm({ ...payslipForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
              </div>

              {/* Primes */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-slate-700 mb-3">💰 Primes et Indemnités</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Prime Transport (DZD)</label>
                    <input 
                      type="number" 
                      value={payslipForm.prime_transport} 
                      onChange={(e) => setPayslipForm({ ...payslipForm, prime_transport: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Prime Rendement (DZD)</label>
                    <input 
                      type="number" 
                      value={payslipForm.prime_rendement} 
                      onChange={(e) => setPayslipForm({ ...payslipForm, prime_rendement: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Heures sup et retenues */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Heures Supp. (DZD)</label>
                  <input 
                    type="number" 
                    value={payslipForm.heures_supp} 
                    onChange={(e) => setPayslipForm({ ...payslipForm, heures_supp: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Retenues (DZD)</label>
                  <input 
                    type="number" 
                    value={payslipForm.retenues} 
                    onChange={(e) => setPayslipForm({ ...payslipForm, retenues: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Aperçu calcul */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">📊 Aperçu du calcul</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Salaire de base</span>
                    <span>{formatCurrency(selectedEmployee.salaire_base)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>+ Primes</span>
                    <span>+{formatCurrency(payslipForm.prime_transport + payslipForm.prime_rendement + payslipForm.heures_supp)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Salaire Brut estimé</span>
                    <span>{formatCurrency(selectedEmployee.salaire_base + payslipForm.prime_transport + payslipForm.prime_rendement + payslipForm.heures_supp)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- CNAS (9%)</span>
                    <span>-{formatCurrency((selectedEmployee.salaire_base + payslipForm.prime_transport + payslipForm.prime_rendement + payslipForm.heures_supp) * 0.09)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- Retenues</span>
                    <span>-{formatCurrency(payslipForm.retenues)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                <p className="font-medium">ℹ️ Information</p>
                <p>L'IRG sera calculé automatiquement selon le barème algérien.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowPayslipModal(false)} 
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard/payslips')}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Voir tous les bulletins
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Création...' : '✓ Créer le bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
