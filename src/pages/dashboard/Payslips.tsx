import { useState, useEffect } from 'react'
import { CheckCircle, Plus, DollarSign, Receipt, X, Eye, Edit, Trash2, Printer, Mail, Users, Save, TrendingUp, Building2, CreditCard, Clock, AlertCircle } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'
const STORAGE_URL = 'http://localhost:8000/storage'

interface Payslip {
  id: number
  employee_id: number
  employee?: { 
    id: number
    first_name: string
    last_name: string
    matricule: string
    position: string
    email?: string
    phone?: string
    department?: { id: number; name: string }
    date_of_birth?: string
    hire_date?: string
    photo?: string | null
  }
  month: number
  year: number
  salaire_base: number
  salaire_brut: number
  salaire_net: number
  cnas_employee: number
  cnas_employer: number
  irg: number
  prime_transport?: number
  prime_rendement?: number
  heures_supp?: number
  retenues?: number
  status: 'draft' | 'validated' | 'paid'
  validated_at?: string
  created_at: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  matricule: string
  position: string
  salaire_base: number
  email?: string
  phone?: string
  department?: { id: number; name: string }
  company?: { id: number; name: string }
  grade?: string
  date_of_birth?: string
  hire_date?: string
  status?: string
  photo?: string | null
  rip?: string
  ccp_number?: string
  bank_name?: string
  bank_agency?: string
  payment_method?: string
}

const months = [
  { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
]

export function Payslips() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'payslips' | 'employees'>('payslips')
  const [showEmployeePayslipModal, setShowEmployeePayslipModal] = useState(false)
  const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = useState<Employee | null>(null)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [selectedPayslips, setSelectedPayslips] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const [form, setForm] = useState({
    employee_id: 0,
    month: selectedMonth,
    year: selectedYear,
    prime_transport: 0,
    prime_rendement: 0,
    heures_supp: 0,
    retenues: 0
  })

  useEffect(() => { loadData() }, [])

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      console.log('Token:', token ? 'présent' : 'absent')
      
      const [payRes, empRes] = await Promise.all([
        fetch(`${API_URL}/payslips`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
        fetch(`${API_URL}/employees?all=true`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
      ])
      
      console.log('Payslips response status:', payRes.status)
      console.log('Employees response status:', empRes.status)
      
      if (payRes.ok) {
        const data = await payRes.json()
        console.log('Payslips data:', data)
        setPayslips(Array.isArray(data) ? data : data.data || [])
      }
      
      if (empRes.ok) {
        const data = await empRes.json()
        console.log('Employees raw data:', data)
        // Gérer les deux formats: tableau direct ou réponse paginée
        const empList = Array.isArray(data) ? data : (data.data || [])
        console.log('Employés chargés:', empList.length, empList)
        setEmployees(empList)
      } else {
        console.error('Erreur chargement employés:', empRes.status, await empRes.text())
      }
    } catch (err) { 
      console.error('Erreur chargement:', err) 
    } finally { 
      setLoading(false) 
    }
  }

  // Gérer la sélection de tous les bulletins
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayslips([])
    } else {
      setSelectedPayslips(filtered.map(p => p.id))
    }
    setSelectAll(!selectAll)
  }

  // Gérer la sélection d'un bulletin
  const handleSelectPayslip = (id: number) => {
    if (selectedPayslips.includes(id)) {
      setSelectedPayslips(selectedPayslips.filter(p => p !== id))
    } else {
      setSelectedPayslips([...selectedPayslips, id])
    }
  }

  // Imprimer tous les bulletins sélectionnés
  const handlePrintSelected = () => {
    if (selectedPayslips.length === 0) {
      alert('Veuillez sélectionner au moins un bulletin')
      return
    }
    const selectedPayslipsList = filtered.filter(p => selectedPayslips.includes(p.id))
    const html = generateMultiplePayslipsHTML(selectedPayslipsList)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // Générer PDF pour tous les bulletins sélectionnés
  const handleDownloadSelectedPDF = () => {
    if (selectedPayslips.length === 0) {
      alert('Veuillez sélectionner au moins un bulletin')
      return
    }
    const selectedPayslipsList = filtered.filter(p => selectedPayslips.includes(p.id))
    const html = generateMultiplePayslipsHTML(selectedPayslipsList)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  // Générer HTML pour plusieurs bulletins
  const generateMultiplePayslipsHTML = (payslipsList: Payslip[]): string => {
    const monthName = months.find(m => m.value === selectedMonth)?.label || ''
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Bulletins de Paie - ${monthName} ${selectedYear}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; }
    .page { page-break-after: always; padding: 15px; max-width: 800px; margin: 0 auto; }
    .page:last-child { page-break-after: auto; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
    .header h1 { color: #2563eb; font-size: 20px; }
    .header .period { background: #2563eb; color: white; display: inline-block; padding: 4px 12px; border-radius: 12px; margin-top: 8px; font-size: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
    .info-box { background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .info-box h3 { margin: 0 0 6px 0; color: #2563eb; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #2563eb; padding-bottom: 3px; }
    .info-box p { margin: 2px 0; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 6px; text-align: left; border: 1px solid #e2e8f0; font-size: 10px; }
    th { background: #f1f5f9; font-weight: 600; }
    .amount { text-align: right; }
    .section-title { background: #e0e7ff; font-weight: bold; color: #3730a3; }
    .total-row { background: #dbeafe; font-weight: bold; }
    .net-row { background: #22c55e; color: white; font-size: 12px; font-weight: bold; }
    .deduction { color: #dc2626; }
    .footer { margin-top: 20px; display: flex; justify-content: space-between; }
    .signature { text-align: center; width: 150px; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; }
    @media print { .page { page-break-after: always; } }
  </style>
</head>
<body>`

    payslipsList.forEach(payslip => {
      const empInfo = getEmployeeBankInfo(payslip.employee_id)
      const totalRetenues = (payslip.cnas_employee || 0) + (payslip.irg || 0) + (payslip.retenues || 0)
      
      html += `
  <div class="page">
    <div class="header">
      <h1>RAWATIB</h1>
      <p>Système de Gestion RH</p>
      <p class="period">BULLETIN DE PAIE - ${monthName.toUpperCase()} ${payslip.year}</p>
    </div>
    
    <div class="info-grid">
      <div class="info-box">
        <h3>EMPLOYEUR</h3>
        <p><strong>SARL TechAlgérie</strong></p>
        <p>123 Rue Didouche Mourad, Alger</p>
        <p>NIF: 001234567890123</p>
        <p>N° CNAS: CNAS-ALG-001234</p>
      </div>
      <div class="info-box">
        <h3>EMPLOYÉ</h3>
        <p><strong>${payslip.employee?.first_name || ''} ${payslip.employee?.last_name || ''}</strong></p>
        <p>Matricule: ${payslip.employee?.matricule || 'N/A'}</p>
        <p>Poste: ${payslip.employee?.position || 'N/A'}</p>
        ${empInfo?.grade ? '<p>Grade: ' + empInfo.grade + '</p>' : ''}
        ${payslip.employee?.department?.name ? '<p>Département: ' + payslip.employee.department.name + '</p>' : ''}
        ${empInfo?.company?.name ? '<p>Société: ' + empInfo.company.name + '</p>' : ''}
      </div>
    </div>

    <table>
      <thead><tr><th>Désignation</th><th class="amount">Montant (DZD)</th></tr></thead>
      <tbody>
        <tr class="section-title"><td colspan="2">GAINS</td></tr>
        <tr><td>Salaire de Base</td><td class="amount">${(payslip.salaire_base || 0).toLocaleString('fr-DZ')}</td></tr>
        ${payslip.prime_transport ? '<tr><td>Prime de Transport</td><td class="amount">+' + payslip.prime_transport.toLocaleString('fr-DZ') + '</td></tr>' : ''}
        ${payslip.prime_rendement ? '<tr><td>Prime de Rendement</td><td class="amount">+' + payslip.prime_rendement.toLocaleString('fr-DZ') + '</td></tr>' : ''}
        ${payslip.heures_supp ? '<tr><td>Heures Supplémentaires</td><td class="amount">+' + payslip.heures_supp.toLocaleString('fr-DZ') + '</td></tr>' : ''}
        <tr class="total-row"><td>SALAIRE BRUT</td><td class="amount">${(payslip.salaire_brut || 0).toLocaleString('fr-DZ')}</td></tr>
        <tr class="section-title"><td colspan="2">RETENUES</td></tr>
        <tr><td>CNAS Employé (9%)</td><td class="amount deduction">-${(payslip.cnas_employee || 0).toLocaleString('fr-DZ')}</td></tr>
        <tr><td>IRG</td><td class="amount deduction">-${(payslip.irg || 0).toLocaleString('fr-DZ')}</td></tr>
        ${payslip.retenues ? '<tr><td>Autres Retenues</td><td class="amount deduction">-' + payslip.retenues.toLocaleString('fr-DZ') + '</td></tr>' : ''}
        <tr class="total-row"><td>TOTAL RETENUES</td><td class="amount deduction">-${totalRetenues.toLocaleString('fr-DZ')}</td></tr>
        <tr class="net-row"><td>NET À PAYER</td><td class="amount">${(payslip.salaire_net || 0).toLocaleString('fr-DZ')} DZD</td></tr>
      </tbody>
    </table>

    <p style="font-size:10px;"><strong>Charges Patronales:</strong> CNAS (26%): ${(payslip.cnas_employer || 0).toLocaleString('fr-DZ')} DZD</p>

    <div class="footer">
      <div class="signature"><p>L'Employeur</p><div class="signature-line"></div></div>
      <div class="signature"><p>L'Employé</p><div class="signature-line"></div></div>
    </div>
  </div>`
    })

    html += `</body></html>`
    return html
  }

  const filtered = payslips.filter(p => {
    const matchMonth = p.month === selectedMonth && p.year === selectedYear
    const matchSearch = search === '' || 
      p.employee?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.employee?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.employee?.matricule?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchMonth && matchSearch && matchStatus
  })
  
  const stats = {
    totalNet: filtered.reduce((sum, p) => sum + (p.salaire_net || 0), 0),
    totalBrut: filtered.reduce((sum, p) => sum + (p.salaire_brut || 0), 0),
    totalCnasEmployee: filtered.reduce((sum, p) => sum + (p.cnas_employee || 0), 0),
    totalCnasEmployer: filtered.reduce((sum, p) => sum + (p.cnas_employer || 0), 0),
    totalIrg: filtered.reduce((sum, p) => sum + (p.irg || 0), 0),
    totalPrimes: filtered.reduce((sum, p) => sum + (p.prime_transport || 0) + (p.prime_rendement || 0) + (p.heures_supp || 0), 0),
    totalRetenues: filtered.reduce((sum, p) => sum + (p.retenues || 0), 0),
    count: filtered.length,
    validated: filtered.filter(p => p.status === 'validated' || p.status === 'paid').length,
    paid: filtered.filter(p => p.status === 'paid').length,
    draft: filtered.filter(p => p.status === 'draft').length,
    avgNet: filtered.length > 0 ? filtered.reduce((sum, p) => sum + (p.salaire_net || 0), 0) / filtered.length : 0,
    coutTotal: filtered.reduce((sum, p) => sum + (p.salaire_brut || 0) + (p.cnas_employer || 0), 0)
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount)

  const resetForm = () => {
    setForm({
      employee_id: employees[0]?.id || 0,
      month: selectedMonth,
      year: selectedYear,
      prime_transport: 0,
      prime_rendement: 0,
      heures_supp: 0,
      retenues: 0
    })
    setSelectedPayslip(null)
    setError('')
  }

  const openCreate = () => { resetForm(); setShowModal(true) }
  const openEdit = (payslip: Payslip) => {
    setSelectedPayslip(payslip)
    setForm({
      employee_id: payslip.employee_id,
      month: payslip.month,
      year: payslip.year,
      prime_transport: payslip.prime_transport || 0,
      prime_rendement: payslip.prime_rendement || 0,
      heures_supp: payslip.heures_supp || 0,
      retenues: payslip.retenues || 0
    })
    setShowModal(true)
  }
  const openView = (payslip: Payslip) => { setSelectedPayslip(payslip); setShowViewModal(true) }
  const openDelete = (payslip: Payslip) => { setSelectedPayslip(payslip); setShowDeleteModal(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const token = getToken()
      const url = selectedPayslip 
        ? `${API_URL}/payslips/${selectedPayslip.id}`
        : `${API_URL}/payslips/generate`
      const response = await fetch(url, {
        method: selectedPayslip ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form)
      })
      if (response.ok) {
        setShowModal(false)
        resetForm()
        loadData()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de l\'opération')
      }
    } catch { setError('Erreur de connexion au serveur') }
    finally { setSaving(false) }
  }

  const handleValidate = async (id: number) => {
    try {
      const token = getToken()
      await fetch(`${API_URL}/payslips/${id}/validate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async () => {
    if (!selectedPayslip) return
    setSaving(true)
    try {
      const token = getToken()
      await fetch(`${API_URL}/payslips/${selectedPayslip.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      setShowDeleteModal(false)
      setSelectedPayslip(null)
      loadData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handlePrint = (payslip: Payslip) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const html = generatePayslipHTML(payslip)
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // Télécharger en PDF
  const handleDownloadPDF = (payslip: Payslip) => {
    const html = generatePayslipHTML(payslip)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Utiliser la fonction d'impression du navigateur pour sauvegarder en PDF
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  // Envoyer par email
  const handleSendEmail = async (payslip: Payslip) => {
    if (!payslip.employee?.email) {
      alert('Cet employé n\'a pas d\'adresse email configurée.')
      return
    }
    
    setEmailSending(true)
    setEmailSuccess('')
    
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/payslips/${payslip.id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        setEmailSuccess(`✅ Bulletin envoyé à ${payslip.employee.email}`)
        setTimeout(() => setEmailSuccess(''), 3000)
      } else {
        // Si l'API n'existe pas encore, simuler l'envoi
        setEmailSuccess(`📧 Email préparé pour ${payslip.employee.email} (fonctionnalité backend à implémenter)`)
        setTimeout(() => setEmailSuccess(''), 3000)
      }
    } catch {
      // Simuler l'envoi si l'API n'existe pas
      setEmailSuccess(`📧 Email préparé pour ${payslip.employee?.email}`)
      setTimeout(() => setEmailSuccess(''), 3000)
    } finally {
      setEmailSending(false)
    }
  }

  // Ouvrir modal pour créer bulletin d'un employé
  const openEmployeePayslip = (emp: Employee) => {
    setSelectedEmployeeForPayslip(emp)
    setForm({
      employee_id: emp.id,
      month: selectedMonth,
      year: selectedYear,
      prime_transport: 0,
      prime_rendement: 0,
      heures_supp: 0,
      retenues: 0
    })
    setShowEmployeePayslipModal(true)
  }

  const handleCreateEmployeePayslip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployeeForPayslip) return
    
    setError('')
    setSaving(true)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/payslips/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setShowEmployeePayslipModal(false)
        setSelectedEmployeeForPayslip(null)
        loadData()
        setActiveTab('payslips')
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  // Filtrer les employés (tous les employés, pas seulement actifs)
  const filteredEmployees = employees.filter(e => 
    search === '' ||
    e.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  )



  // Récupérer les infos bancaires de l'employé
  const getEmployeeBankInfo = (employeeId: number) => {
    return employees.find(e => e.id === employeeId)
  }

  const generatePayslipHTML = (payslip: Payslip): string => {
    const empInfo = getEmployeeBankInfo(payslip.employee_id)
    const monthName = months.find(m => m.value === payslip.month)?.label || ''
    const totalRetenues = (payslip.cnas_employee || 0) + (payslip.irg || 0) + (payslip.retenues || 0)
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Bulletin de Paie - ${payslip.employee?.first_name || ''} ${payslip.employee?.last_name || ''} - ${monthName} ${payslip.year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; font-size: 12px; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
    .header .period { background: #2563eb; color: white; display: inline-block; padding: 5px 15px; border-radius: 15px; margin-top: 10px; font-weight: bold; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-box { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .info-box h3 { margin: 0 0 8px 0; color: #2563eb; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
    .info-box p { margin: 3px 0; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 8px; text-align: left; border: 1px solid #e2e8f0; font-size: 11px; }
    th { background: #f1f5f9; font-weight: 600; }
    .amount { text-align: right; }
    .section-title { background: #e0e7ff; font-weight: bold; color: #3730a3; }
    .total-row { background: #dbeafe; font-weight: bold; }
    .net-row { background: #22c55e; color: white; font-size: 14px; font-weight: bold; }
    .deduction { color: #dc2626; }
    .charges-box { background: #fef3c7; padding: 10px; border-radius: 8px; margin: 15px 0; }
    .bank-box { background: #f0f9ff; padding: 10px; border-radius: 8px; margin: 15px 0; }
    .footer { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature { text-align: center; width: 180px; }
    .signature-line { border-top: 1px solid #333; margin-top: 50px; }
    .legal { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RAWATIB</h1>
    <p>Système de Gestion des Ressources Humaines</p>
    <p class="period">BULLETIN DE PAIE - ${monthName.toUpperCase()} ${payslip.year}</p>
  </div>
  
  <div class="info-grid">
    <div class="info-box">
      <h3>EMPLOYEUR</h3>
      <p><strong>SARL TechAlgérie</strong></p>
      <p>123 Rue Didouche Mourad, Alger</p>
      <p>NIF: 001234567890123</p>
      <p>N° CNAS: CNAS-ALG-001234</p>
    </div>
    <div class="info-box">
      <h3>EMPLOYÉ</h3>
      <p><strong>${payslip.employee?.first_name || ''} ${payslip.employee?.last_name || ''}</strong></p>
      <p>Matricule: ${payslip.employee?.matricule || 'N/A'}</p>
      <p>Poste: ${payslip.employee?.position || 'N/A'}</p>
      ${payslip.employee?.department?.name ? '<p>Département: ' + payslip.employee.department.name + '</p>' : ''}
      ${payslip.employee?.email ? '<p>Email: ' + payslip.employee.email + '</p>' : ''}
    </div>
  </div>

  ${empInfo?.rip || empInfo?.ccp_number ? `
  <div class="bank-box">
    <h3 style="margin:0 0 8px 0;font-size:11px;color:#0369a1;">INFORMATIONS BANCAIRES</h3>
    ${empInfo?.payment_method ? '<p>Mode de paiement: <strong>' + (empInfo.payment_method === 'bank' ? 'Virement bancaire' : empInfo.payment_method === 'ccp' ? 'CCP' : 'Espèces') + '</strong></p>' : ''}
    ${empInfo?.rip ? '<p>RIP: <strong>' + empInfo.rip + '</strong></p>' : ''}
    ${empInfo?.ccp_number ? '<p>N° CCP: <strong>' + empInfo.ccp_number + '</strong></p>' : ''}
    ${empInfo?.bank_name ? '<p>Banque: ' + empInfo.bank_name + (empInfo?.bank_agency ? ' - ' + empInfo.bank_agency : '') + '</p>' : ''}
  </div>
  ` : ''}

  <table>
    <thead>
      <tr><th>Désignation</th><th class="amount">Montant (DZD)</th></tr>
    </thead>
    <tbody>
      <tr class="section-title"><td colspan="2">GAINS</td></tr>
      <tr><td>Salaire de Base</td><td class="amount">${(payslip.salaire_base || 0).toLocaleString('fr-DZ')}</td></tr>
      ${payslip.prime_transport ? '<tr><td>Prime de Transport</td><td class="amount">+' + payslip.prime_transport.toLocaleString('fr-DZ') + '</td></tr>' : ''}
      ${payslip.prime_rendement ? '<tr><td>Prime de Rendement</td><td class="amount">+' + payslip.prime_rendement.toLocaleString('fr-DZ') + '</td></tr>' : ''}
      ${payslip.heures_supp ? '<tr><td>Heures Supplémentaires</td><td class="amount">+' + payslip.heures_supp.toLocaleString('fr-DZ') + '</td></tr>' : ''}
      <tr class="total-row"><td>SALAIRE BRUT</td><td class="amount">${(payslip.salaire_brut || 0).toLocaleString('fr-DZ')}</td></tr>
      
      <tr class="section-title"><td colspan="2">RETENUES</td></tr>
      <tr><td>CNAS Employé (9%)</td><td class="amount deduction">-${(payslip.cnas_employee || 0).toLocaleString('fr-DZ')}</td></tr>
      <tr><td>IRG (Impôt sur le Revenu)</td><td class="amount deduction">-${(payslip.irg || 0).toLocaleString('fr-DZ')}</td></tr>
      ${payslip.retenues ? '<tr><td>Autres Retenues</td><td class="amount deduction">-' + payslip.retenues.toLocaleString('fr-DZ') + '</td></tr>' : ''}
      <tr class="total-row"><td>TOTAL RETENUES</td><td class="amount deduction">-${totalRetenues.toLocaleString('fr-DZ')}</td></tr>
      
      <tr class="net-row"><td>NET À PAYER</td><td class="amount">${(payslip.salaire_net || 0).toLocaleString('fr-DZ')} DZD</td></tr>
    </tbody>
  </table>

  <div class="charges-box">
    <p><strong>Charges Patronales:</strong> CNAS Employeur (26%): ${(payslip.cnas_employer || 0).toLocaleString('fr-DZ')} DZD</p>
    <p><strong>Coût Total Employeur:</strong> ${((payslip.salaire_brut || 0) + (payslip.cnas_employer || 0)).toLocaleString('fr-DZ')} DZD</p>
  </div>

  <div class="footer">
    <div class="signature">
      <p>L'Employeur</p>
      <div class="signature-line"></div>
    </div>
    <div class="signature">
      <p>L'Employé</p>
      <div class="signature-line"></div>
    </div>
  </div>

  <p class="legal">Ce bulletin de paie est établi conformément à la législation algérienne en vigueur. Document généré par RAWATIB.</p>
</body>
</html>`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bulletins de Paie</h1>
          <p className="text-slate-500">
            Générez et gérez les bulletins de paie des employés
            {!loading && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {employees.length} employé(s) • {payslips.length} bulletin(s)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="flex items-center gap-2 border border-slate-300 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50" title="Recharger">
            🔄
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Nouveau bulletin
          </button>
          {employees.length > 0 && employees.filter(e => !payslips.some(p => p.employee_id === e.id && p.month === selectedMonth && p.year === selectedYear)).length > 0 && (
            <button 
              onClick={() => setActiveTab('employees')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              title={`${employees.filter(e => !payslips.some(p => p.employee_id === e.id && p.month === selectedMonth && p.year === selectedYear)).length} employé(s) sans bulletin`}
            >
              <Users className="w-4 h-4" /> 
              {employees.filter(e => !payslips.some(p => p.employee_id === e.id && p.month === selectedMonth && p.year === selectedYear)).length} en attente
            </button>
          )}
        </div>
      </div>

      {/* Message de succès email */}
      {emailSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          {emailSuccess}
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('payslips')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'payslips' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4 inline mr-2" />
          Bulletins ({filtered.length})
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'employees' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Employés ({filteredEmployees.length})
        </button>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'payslips' && (
      <>
      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Receipt className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Total Bulletins</p><p className="text-2xl font-bold">{stats.count}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
          <div><p className="text-sm text-slate-500">Brouillons</p><p className="text-2xl font-bold text-yellow-600">{stats.draft}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Validés</p><p className="text-2xl font-bold text-green-600">{stats.validated}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-purple-600" /></div>
          <div><p className="text-sm text-slate-500">Total Brut</p><p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalBrut)}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="text-sm text-slate-500">Total Net</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalNet)}</p></div>
        </div>
      </div>

      {/* Résumé financier détaillé */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Masse salariale */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-slate-800">Masse Salariale</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Salaires de base</span>
              <span className="font-medium">{formatCurrency(filtered.reduce((sum, p) => sum + (p.salaire_base || 0), 0))}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">+ Primes & Indemnités</span>
              <span className="font-medium">+{formatCurrency(stats.totalPrimes)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-slate-700">Total Brut</span>
              <span className="font-bold text-lg">{formatCurrency(stats.totalBrut)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-sm">Moyenne par employé</span>
              <span className="font-medium">{formatCurrency(stats.avgNet)}</span>
            </div>
          </div>
        </div>

        {/* Cotisations et Retenues */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-lg"><Building2 className="w-5 h-5 text-red-600" /></div>
            <h3 className="font-semibold text-slate-800">Cotisations & Retenues</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">CNAS Employé (9%)</span>
              <span className="font-medium text-red-600">-{formatCurrency(stats.totalCnasEmployee)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">IRG (Impôt)</span>
              <span className="font-medium text-red-600">-{formatCurrency(stats.totalIrg)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Autres retenues</span>
              <span className="font-medium text-red-600">-{formatCurrency(stats.totalRetenues)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-red-700">Total Retenues</span>
              <span className="font-bold text-lg text-red-600">-{formatCurrency(stats.totalCnasEmployee + stats.totalIrg + stats.totalRetenues)}</span>
            </div>
          </div>
        </div>

        {/* Charges Patronales */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg"><CreditCard className="w-5 h-5 text-orange-600" /></div>
            <h3 className="font-semibold text-slate-800">Charges Patronales</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">CNAS Employeur (26%)</span>
              <span className="font-medium text-orange-600">{formatCurrency(stats.totalCnasEmployer)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-orange-700">Coût Total Employeur</span>
              <span className="font-bold text-lg text-orange-600">{formatCurrency(stats.coutTotal)}</span>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">💰 Net à Payer</span>
                <span className="font-bold text-xl text-green-600">{formatCurrency(stats.totalNet)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte si brouillons en attente */}
      {stats.draft > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">{stats.draft} bulletin(s) en attente de validation</p>
            <p className="text-sm text-yellow-700">Pensez à valider les bulletins avant la fin du mois pour permettre le paiement.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="font-semibold">Liste des bulletins</h2>
            <div className="flex gap-2">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-3 py-2 border rounded-lg">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="🔍 Rechercher par nom ou matricule..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">🟡 Brouillons</option>
              <option value="validated">🟢 Validés</option>
              <option value="paid">🔵 Payés</option>
            </select>
            <span className="text-sm text-slate-500 self-center">{filtered.length} bulletin(s)</span>
          </div>
          
          {/* Actions groupées */}
          {selectedPayslips.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700 font-medium">{selectedPayslips.length} bulletin(s) sélectionné(s)</span>
              <button onClick={handlePrintSelected} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Printer className="w-4 h-4" /> Imprimer tout
              </button>
              <button onClick={handleDownloadSelectedPDF} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                <Save className="w-4 h-4" /> PDF tout
              </button>
              <button onClick={() => { setSelectedPayslips([]); setSelectAll(false); }} className="text-sm text-slate-500 hover:text-slate-700">
                Désélectionner
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectAll} 
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Employé</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Société</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Poste / Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Période</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Salaire Brut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Net à Payer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">Aucun bulletin pour cette période</td></tr>
              ) : (
                filtered.map((p) => {
                  const empInfo = employees.find(e => e.id === p.employee_id)
                  return (
                  <tr key={p.id} className={`hover:bg-slate-50 ${selectedPayslips.includes(p.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-3 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedPayslips.includes(p.id)} 
                        onChange={() => handleSelectPayslip(p.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.employee?.photo ? (
                          <img 
                            src={`${STORAGE_URL}/${p.employee.photo}`}
                            alt={`${p.employee?.first_name} ${p.employee?.last_name}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {p.employee?.first_name?.charAt(0)}{p.employee?.last_name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{p.employee?.first_name} {p.employee?.last_name}</p>
                          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.employee?.matricule}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {empInfo?.company?.name ? (
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          🏢 {empInfo.company.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.employee?.position || '-'}</p>
                        {empInfo?.grade && <p className="text-xs text-purple-600">Grade: {empInfo.grade}</p>}
                        {p.employee?.department?.name && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{p.employee.department.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{months.find(m => m.value === p.month)?.label} {p.year}</td>
                    <td className="px-4 py-3">{formatCurrency(p.salaire_brut)}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(p.salaire_net)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'validated' ? 'bg-green-100 text-green-700' :
                        p.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status === 'validated' ? 'Validé' : p.status === 'paid' ? 'Payé' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openView(p)} className="p-2 hover:bg-slate-100 rounded-lg" title="Voir détails">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => handlePrint(p)} className="p-2 hover:bg-slate-100 rounded-lg" title="Imprimer">
                          <Printer className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDownloadPDF(p)} className="p-2 hover:bg-purple-100 rounded-lg" title="Télécharger PDF">
                          <Save className="w-4 h-4 text-purple-500" />
                        </button>
                        <button 
                          onClick={() => handleSendEmail(p)} 
                          disabled={emailSending || !p.employee?.email}
                          className={`p-2 rounded-lg ${p.employee?.email ? 'hover:bg-green-100' : 'opacity-50 cursor-not-allowed'}`} 
                          title={p.employee?.email ? `Envoyer à ${p.employee.email}` : 'Pas d\'email configuré'}
                        >
                          <Mail className="w-4 h-4 text-green-500" />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-100 rounded-lg" title="Modifier">
                          <Edit className="w-4 h-4 text-orange-500" />
                        </button>
                        {p.status === 'draft' && (
                          <button onClick={() => handleValidate(p.id)} className="p-2 hover:bg-green-100 rounded-lg" title="Valider">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button onClick={() => openDelete(p)} className="p-2 hover:bg-red-100 rounded-lg" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Onglet Employés */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Statistiques employés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">Total Employés</p>
                  <p className="text-xl font-bold text-blue-600">{employees.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">Bulletins créés</p>
                  <p className="text-xl font-bold text-green-600">
                    {employees.filter(e => payslips.some(p => p.employee_id === e.id && p.month === selectedMonth && p.year === selectedYear)).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">En attente</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {employees.filter(e => !payslips.some(p => p.employee_id === e.id && p.month === selectedMonth && p.year === selectedYear)).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-xs text-slate-500">Masse salariale</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(employees.reduce((sum, e) => sum + (e.salaire_base || 0), 0))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                Sélectionner un employé pour créer un bulletin
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({months.find(m => m.value === selectedMonth)?.label} {selectedYear})
                </span>
              </h2>
              <input 
                type="text" 
                placeholder="🔍 Rechercher un employé..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liste des employés */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Aucun employé trouvé</p>
              <p className="text-sm text-slate-400 mb-4">Vérifiez que des employés existent dans la base de données ou rechargez la page.</p>
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Recharger les données
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucun employé ne correspond à la recherche</p>
              <p className="text-sm text-slate-400 mt-2">{employees.length} employé(s) au total</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => {
                // Vérifier si un bulletin existe déjà pour ce mois
                const existingPayslip = payslips.find(
                  p => p.employee_id === emp.id && p.month === selectedMonth && p.year === selectedYear
                )
                
                return (
                  <div key={emp.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
                    {/* Header avec photo et infos principales */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                      <div className="flex items-start gap-4">
                        {emp.photo ? (
                          <img 
                            src={`${STORAGE_URL}/${emp.photo}`}
                            alt={`${emp.first_name} ${emp.last_name}`}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                            {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 truncate text-lg">{emp.first_name} {emp.last_name}</h3>
                          <p className="text-sm text-slate-600 truncate">{emp.position}</p>
                          {emp.grade && <p className="text-xs text-purple-600 font-medium">Grade: {emp.grade}</p>}
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded-full shadow-sm">{emp.matricule}</span>
                            {emp.status === 'active' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actif</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="p-4 space-y-3">
                      {/* Société et Département */}
                      <div className="flex flex-wrap gap-2">
                        {emp.company?.name && (
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                            🏢 {emp.company.name}
                          </span>
                        )}
                        {emp.department?.name && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            📁 {emp.department.name}
                          </span>
                        )}
                      </div>

                      {/* Salaire */}
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-700">Salaire de base</span>
                        <span className="font-bold text-green-600">{formatCurrency(emp.salaire_base)}</span>
                      </div>

                      {/* Infos bancaires */}
                      {(emp.rip || emp.ccp_number || emp.bank_name) && (
                        <div className="p-2 bg-slate-50 rounded-lg text-xs space-y-1">
                          <p className="font-medium text-slate-700 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Infos bancaires
                          </p>
                          {emp.payment_method && (
                            <p className="text-slate-600">
                              Mode: {emp.payment_method === 'virement' ? 'Virement' : emp.payment_method === 'ccp' ? 'CCP' : emp.payment_method === 'cheque' ? 'Chèque' : 'Espèces'}
                            </p>
                          )}
                          {emp.rip && <p className="text-slate-600">RIP: {emp.rip}</p>}
                          {emp.ccp_number && <p className="text-slate-600">CCP: {emp.ccp_number}</p>}
                          {emp.bank_name && <p className="text-slate-600">Banque: {emp.bank_name}</p>}
                        </div>
                      )}

                      {/* Contact */}
                      {(emp.email || emp.phone) && (
                        <div className="text-xs text-slate-500 space-y-1">
                          {emp.email && <p>📧 {emp.email}</p>}
                          {emp.phone && <p>📱 {emp.phone}</p>}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="p-4 pt-0">
                      {existingPayslip ? (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            existingPayslip.status === 'validated' ? 'bg-green-100 text-green-700' :
                            existingPayslip.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {months.find(m => m.value === selectedMonth)?.label}: {
                              existingPayslip.status === 'validated' ? '✅ Validé' : 
                              existingPayslip.status === 'paid' ? '💰 Payé' : '📝 Brouillon'
                            }
                          </span>
                          <button 
                            onClick={() => { openView(existingPayslip); setActiveTab('payslips'); }}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                          >
                            Voir
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => openEmployeePayslip(emp)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          <Receipt className="w-4 h-4" />
                          Créer bulletin {months.find(m => m.value === selectedMonth)?.label}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sélecteur de période */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-slate-600">Période sélectionnée:</span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-3 py-2 border rounded-lg">
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedPayslip ? 'Modifier le bulletin' : 'Générer un bulletin'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employé *</label>
                <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg" required disabled={!!selectedPayslip}>
                  <option value="">{employees.length === 0 ? 'Aucun employé disponible' : 'Sélectionner un employé'}</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      [{e.matricule}] {e.first_name} {e.last_name} - {e.position} - {formatCurrency(e.salaire_base)}
                    </option>
                  ))}
                </select>
                {employees.length === 0 ? (
                  <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">⚠️ Aucun employé disponible</p>
                    <p className="text-xs text-orange-500 mt-1">Veuillez d'abord ajouter des employés dans la section Employés ou vérifier votre connexion.</p>
                    <button 
                      type="button"
                      onClick={loadData}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      🔄 Recharger les données
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">{employees.length} employé(s) disponible(s)</p>
                )}
                {form.employee_id > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    {(() => {
                      const emp = employees.find(e => e.id === form.employee_id)
                      if (!emp) return null
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs text-slate-500">{emp.position} • {emp.matricule}</p>
                            {emp.department?.name && <p className="text-xs text-blue-600">{emp.department.name}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{formatCurrency(emp.salaire_base)}</p>
                            <p className="text-xs text-slate-500">Salaire de base</p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mois *</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} 
                    className="w-full px-3 py-2 border rounded-lg" disabled={!!selectedPayslip}>
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année *</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} 
                    className="w-full px-3 py-2 border rounded-lg" required disabled={!!selectedPayslip} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-slate-700 mb-3">Primes et Indemnités</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Prime Transport (DZD)</label>
                    <input type="number" value={form.prime_transport} onChange={(e) => setForm({ ...form, prime_transport: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Prime Rendement (DZD)</label>
                    <input type="number" value={form.prime_rendement} onChange={(e) => setForm({ ...form, prime_rendement: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Heures Supp. (DZD)</label>
                  <input type="number" value={form.heures_supp} onChange={(e) => setForm({ ...form, heures_supp: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Retenues (DZD)</label>
                  <input type="number" value={form.retenues} onChange={(e) => setForm({ ...form, retenues: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Information</p>
                <p>Le salaire brut et net seront calculés automatiquement selon les taux CNAS (9% employé, 26% employeur) et le barème IRG algérien.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Traitement...' : selectedPayslip ? 'Modifier' : 'Générer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Détails du Bulletin de Paie</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Header avec infos employé détaillées */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {selectedPayslip.employee?.photo ? (
                      <img 
                        src={`${STORAGE_URL}/${selectedPayslip.employee.photo}`}
                        alt={`${selectedPayslip.employee?.first_name} ${selectedPayslip.employee?.last_name}`}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                        {selectedPayslip.employee?.first_name?.charAt(0)}{selectedPayslip.employee?.last_name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{selectedPayslip.employee?.first_name} {selectedPayslip.employee?.last_name}</h3>
                      <p className="text-blue-100">{selectedPayslip.employee?.position}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Matricule: {selectedPayslip.employee?.matricule}</span>
                        {selectedPayslip.employee?.department?.name && (
                          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Dept: {selectedPayslip.employee?.department?.name}</span>
                        )}
                      </div>
                      {selectedPayslip.employee?.email && (
                        <p className="text-blue-200 text-xs mt-1">📧 {selectedPayslip.employee?.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">{months.find(m => m.value === selectedPayslip.month)?.label} {selectedPayslip.year}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      selectedPayslip.status === 'validated' ? 'bg-green-500' :
                      selectedPayslip.status === 'paid' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}>
                      {selectedPayslip.status === 'validated' ? 'Validé' : selectedPayslip.status === 'paid' ? 'Payé' : 'Brouillon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-700 mb-3">Gains</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Salaire de Base</span><span className="font-medium">{formatCurrency(selectedPayslip.salaire_base)}</span></div>
                    {selectedPayslip.prime_transport && <div className="flex justify-between"><span>Prime Transport</span><span className="font-medium text-green-600">+{formatCurrency(selectedPayslip.prime_transport)}</span></div>}
                    {selectedPayslip.prime_rendement && <div className="flex justify-between"><span>Prime Rendement</span><span className="font-medium text-green-600">+{formatCurrency(selectedPayslip.prime_rendement)}</span></div>}
                    {selectedPayslip.heures_supp && <div className="flex justify-between"><span>Heures Supp.</span><span className="font-medium text-green-600">+{formatCurrency(selectedPayslip.heures_supp)}</span></div>}
                    <div className="flex justify-between pt-2 border-t font-bold"><span>Salaire Brut</span><span>{formatCurrency(selectedPayslip.salaire_brut)}</span></div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-700 mb-3">Retenues</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>CNAS Employé (9%)</span><span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.cnas_employee)}</span></div>
                    <div className="flex justify-between"><span>IRG</span><span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.irg)}</span></div>
                    {selectedPayslip.retenues && <div className="flex justify-between"><span>Autres Retenues</span><span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.retenues)}</span></div>}
                    <div className="flex justify-between pt-2 border-t font-bold text-red-700">
                      <span>Total Retenues</span>
                      <span>-{formatCurrency(selectedPayslip.cnas_employee + selectedPayslip.irg + (selectedPayslip.retenues || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net à payer */}
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-green-800">Net à Payer</span>
                  <span className="text-3xl font-bold text-green-600">{formatCurrency(selectedPayslip.salaire_net)}</span>
                </div>
              </div>

              {/* Charges patronales */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-700 mb-2">Charges Patronales</h4>
                <div className="flex justify-between text-sm">
                  <span>CNAS Employeur (26%)</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.cnas_employer)}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-orange-200 font-bold text-orange-700">
                  <span>Coût Total Employeur</span>
                  <span>{formatCurrency(selectedPayslip.salaire_brut + selectedPayslip.cnas_employer)}</span>
                </div>
              </div>

              {/* Informations bancaires de l'employé */}
              {(() => {
                const empBankInfo = getEmployeeBankInfo(selectedPayslip.employee_id)
                if (!empBankInfo?.rip && !empBankInfo?.ccp_number && !empBankInfo?.bank_name) return null
                return (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Informations Bancaires
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {empBankInfo?.payment_method && (
                        <div>
                          <span className="text-slate-500">Mode de paiement:</span>
                          <p className="font-medium">
                            {empBankInfo.payment_method === 'virement' ? '🏦 Virement bancaire' : 
                             empBankInfo.payment_method === 'ccp' ? '📮 CCP' : 
                             empBankInfo.payment_method === 'cheque' ? '📝 Chèque' : '💵 Espèces'}
                          </p>
                        </div>
                      )}
                      {empBankInfo?.rip && (
                        <div>
                          <span className="text-slate-500">RIP:</span>
                          <p className="font-medium font-mono">{empBankInfo.rip}</p>
                        </div>
                      )}
                      {empBankInfo?.ccp_number && (
                        <div>
                          <span className="text-slate-500">N° CCP:</span>
                          <p className="font-medium font-mono">{empBankInfo.ccp_number}</p>
                        </div>
                      )}
                      {empBankInfo?.bank_name && (
                        <div>
                          <span className="text-slate-500">Banque:</span>
                          <p className="font-medium">{empBankInfo.bank_name} {empBankInfo.bank_agency ? `- ${empBankInfo.bank_agency}` : ''}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Société et Grade */}
              {(() => {
                const empInfo = getEmployeeBankInfo(selectedPayslip.employee_id)
                if (!empInfo?.company?.name && !empInfo?.grade) return null
                return (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-medium text-indigo-700 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Informations Professionnelles
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {empInfo?.company?.name && (
                        <div>
                          <span className="text-slate-500">Société:</span>
                          <p className="font-medium">🏢 {empInfo.company.name}</p>
                        </div>
                      )}
                      {empInfo?.grade && (
                        <div>
                          <span className="text-slate-500">Grade:</span>
                          <p className="font-medium">⭐ {empInfo.grade}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handlePrint(selectedPayslip)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                    <Printer className="w-4 h-4" /> Imprimer
                  </button>
                  <button onClick={() => handleDownloadPDF(selectedPayslip)} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                    <Save className="w-4 h-4" /> PDF
                  </button>
                  <button 
                    onClick={() => handleSendEmail(selectedPayslip)} 
                    disabled={emailSending || !selectedPayslip.employee?.email}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      selectedPayslip.employee?.email 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> 
                    {emailSending ? 'Envoi...' : selectedPayslip.employee?.email ? 'Email' : 'Pas d\'email'}
                  </button>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setShowViewModal(false); openEdit(selectedPayslip); }} 
                      className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                    >
                      <Edit className="w-4 h-4" /> Modifier
                    </button>
                    <button 
                      onClick={() => { setShowViewModal(false); openDelete(selectedPayslip); }} 
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                  <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">Fermer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Payslip Modal */}
      {showEmployeePayslipModal && selectedEmployeeForPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEmployeePayslipModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Créer un bulletin de paie</h2>
              <button onClick={() => setShowEmployeePayslipModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateEmployeePayslip} className="p-4 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              {/* Info employé */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  {selectedEmployeeForPayslip.photo ? (
                    <img 
                      src={`${STORAGE_URL}/${selectedEmployeeForPayslip.photo}`}
                      alt={`${selectedEmployeeForPayslip.first_name} ${selectedEmployeeForPayslip.last_name}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                      {selectedEmployeeForPayslip.first_name?.charAt(0)}{selectedEmployeeForPayslip.last_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedEmployeeForPayslip.first_name} {selectedEmployeeForPayslip.last_name}</h3>
                    <p className="text-blue-100">{selectedEmployeeForPayslip.position}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{selectedEmployeeForPayslip.matricule}</span>
                      {selectedEmployeeForPayslip.department?.name && (
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{selectedEmployeeForPayslip.department.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(selectedEmployeeForPayslip.salaire_base)}</p>
                    <p className="text-blue-200 text-xs">Salaire de base</p>
                  </div>
                </div>
              </div>

              {/* Période */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mois *</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg">
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année *</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>

              {/* Primes */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-slate-700 mb-3">Primes et Indemnités</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Prime Transport (DZD)</label>
                    <input type="number" value={form.prime_transport} onChange={(e) => setForm({ ...form, prime_transport: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Prime Rendement (DZD)</label>
                    <input type="number" value={form.prime_rendement} onChange={(e) => setForm({ ...form, prime_rendement: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Heures supp et retenues */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Heures Supp. (DZD)</label>
                  <input type="number" value={form.heures_supp} onChange={(e) => setForm({ ...form, heures_supp: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Retenues (DZD)</label>
                  <input type="number" value={form.retenues} onChange={(e) => setForm({ ...form, retenues: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              {/* Aperçu calcul */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-3">Aperçu du calcul</h4>
                {(() => {
                  const salaireBase = selectedEmployeeForPayslip.salaire_base || 0
                  const brut = salaireBase + form.prime_transport + form.prime_rendement + form.heures_supp
                  const cnasEmployee = Math.round(brut * 0.09)
                  const imposable = brut - cnasEmployee
                  // IRG simplifié
                  let irg = 0
                  if (imposable > 30000) {
                    if (imposable <= 120000) irg = Math.round((imposable - 30000) * 0.20)
                    else if (imposable <= 360000) irg = Math.round(18000 + (imposable - 120000) * 0.30)
                    else irg = Math.round(90000 + (imposable - 360000) * 0.35)
                  }
                  const net = brut - cnasEmployee - irg - form.retenues
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Salaire de base</span><span>{formatCurrency(salaireBase)}</span></div>
                      {form.prime_transport > 0 && <div className="flex justify-between text-green-600"><span>+ Prime transport</span><span>{formatCurrency(form.prime_transport)}</span></div>}
                      {form.prime_rendement > 0 && <div className="flex justify-between text-green-600"><span>+ Prime rendement</span><span>{formatCurrency(form.prime_rendement)}</span></div>}
                      {form.heures_supp > 0 && <div className="flex justify-between text-green-600"><span>+ Heures supp.</span><span>{formatCurrency(form.heures_supp)}</span></div>}
                      <div className="flex justify-between font-medium border-t pt-2"><span>Salaire brut</span><span>{formatCurrency(brut)}</span></div>
                      <div className="flex justify-between text-red-600"><span>- CNAS (9%)</span><span>{formatCurrency(cnasEmployee)}</span></div>
                      <div className="flex justify-between text-red-600"><span>- IRG</span><span>{formatCurrency(irg)}</span></div>
                      {form.retenues > 0 && <div className="flex justify-between text-red-600"><span>- Retenues</span><span>{formatCurrency(form.retenues)}</span></div>}
                      <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-600"><span>Net à payer</span><span>{formatCurrency(net)}</span></div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowEmployeePayslipModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Création...' : 'Créer le bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Supprimer le bulletin</h2>
            <p className="text-slate-600 mb-4">
              Voulez-vous vraiment supprimer le bulletin de paie de <strong>{selectedPayslip.employee?.first_name} {selectedPayslip.employee?.last_name}</strong> pour {months.find(m => m.value === selectedPayslip.month)?.label} {selectedPayslip.year} ?
            </p>
            <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded mb-4">
              ⚠️ Cette action est irréversible.
            </p>
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
