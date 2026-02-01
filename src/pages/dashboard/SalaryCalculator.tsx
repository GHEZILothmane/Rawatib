import { useState, useEffect } from 'react'
import { Calculator, DollarSign, User, Clock, Sparkles, FileText, Brain, AlertTriangle, TrendingUp, Zap } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'

interface Employee {
  id: number
  matricule: string
  first_name: string
  last_name: string
  position: string
  salaire_base: number
  department?: { name: string }
}

interface AttendanceStats {
  jours_travailles: number
  jours_absence: number
  heures_supp: number
  retards: number
}

interface AIAnalysis {
  score_performance: number
  recommandations: string[]
  anomalies: string[]
  prediction_prime: number
  niveau_risque: 'low' | 'medium' | 'high'
  insights: string[]
}

const months = [
  { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
]

export function SalaryCalculator() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [salaireBase, setSalaireBase] = useState(50000)
  const [primeTransport, setPrimeTransport] = useState(3000)
  const [primeRendement, setPrimeRendement] = useState(0)
  const [primePanier, setPrimePanier] = useState(0)
  const [retenues, setRetenues] = useState(0)
  const [heuresSupp, setHeuresSupp] = useState(0)
  const [tauxHoraire, setTauxHoraire] = useState(300)
  const [joursAbsence, setJoursAbsence] = useState(0)

  useEffect(() => { loadEmployees() }, [])
  const getToken = () => localStorage.getItem('token')


  const loadEmployees = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        // Gérer les deux formats: tableau direct ou objet paginé avec data
        const employeesList = Array.isArray(data) ? data : (data.data || [])
        setEmployees(employeesList)
        console.log('Employés chargés:', employeesList.length)
      }
    } catch (err) { console.error('Erreur chargement employés:', err) }
    finally { setLoading(false) }
  }

  const loadAttendanceStats = async (employeeId: number) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/attendances?employee_id=${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        const records = data.data || data || []
        const stats: AttendanceStats = {
          jours_travailles: records.filter((r: any) => r.status === 'present' || r.status === 'late').length,
          jours_absence: records.filter((r: any) => r.status === 'absent').length,
          heures_supp: records.reduce((sum: number, r: any) => sum + (r.hours_worked > 8 ? r.hours_worked - 8 : 0), 0),
          retards: records.filter((r: any) => r.status === 'late').length
        }
        setAttendanceStats(stats)
        if (stats.heures_supp > 0) setHeuresSupp(stats.heures_supp)
        if (stats.jours_absence > 0) setJoursAbsence(stats.jours_absence)
      }
    } catch (err) { console.error(err) }
  }

  const handleEmployeeSelect = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId)
    if (emp) {
      setSelectedEmployee(emp)
      setSalaireBase(emp.salaire_base)
      setTauxHoraire(Math.round(emp.salaire_base / 173.33))
      loadAttendanceStats(employeeId)
      setAiAnalysis(null)
      setShowAIPanel(false)
    } else {
      setSelectedEmployee(null)
      setAttendanceStats(null)
      setAiAnalysis(null)
    }
  }

  const runAIAnalysis = async () => {
    if (!selectedEmployee || !attendanceStats) return
    setCalculating(true)
    setShowAIPanel(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const tauxPresence = attendanceStats.jours_travailles / 22 * 100
    const tauxRetard = attendanceStats.retards / 22 * 100
    let score = 70
    score += (tauxPresence - 80) * 0.5
    score -= tauxRetard * 2
    score += attendanceStats.heures_supp * 0.5
    score = Math.max(0, Math.min(100, score))
    const predictionPrime = Math.round(selectedEmployee.salaire_base * (score / 100) * 0.1)
    const anomalies: string[] = []
    if (attendanceStats.jours_absence > 5) anomalies.push(`Absences élevées: ${attendanceStats.jours_absence} jours`)
    if (attendanceStats.retards > 3) anomalies.push(`Retards fréquents: ${attendanceStats.retards} fois`)
    if (attendanceStats.heures_supp > 20) anomalies.push(`Heures supp. excessives: ${attendanceStats.heures_supp}h`)
    const recommandations: string[] = []
    if (score >= 80) {
      recommandations.push('Excellent profil - Éligible à une prime de rendement')
      recommandations.push(`Prime suggérée: ${predictionPrime.toLocaleString()} DZD`)
    } else if (score >= 60) {
      recommandations.push('Bon profil - Prime standard recommandée')
      recommandations.push('Surveiller les retards pour améliorer le score')
    } else {
      recommandations.push('Profil à améliorer - Entretien recommandé')
      recommandations.push('Réduire les absences pour augmenter le score')
    }
    const insights: string[] = [
      `Taux de présence: ${tauxPresence.toFixed(1)}%`,
      `Productivité: ${score >= 70 ? 'Bonne' : 'À améliorer'}`,
      `Tendance: ${attendanceStats.heures_supp > 10 ? 'Surcharge' : 'Normale'}`,
      `Équipe: ${score >= 75 ? 'Au-dessus moyenne' : 'Dans moyenne'}`
    ]
    const niveau_risque = anomalies.length === 0 ? 'low' : anomalies.length <= 2 ? 'medium' : 'high'
    setAiAnalysis({ score_performance: Math.round(score), recommandations, anomalies, prediction_prime: predictionPrime, niveau_risque, insights })
    if (score >= 60) {
      setPrimeRendement(predictionPrime)
      setPrimeTransport(selectedEmployee.salaire_base > 60000 ? 5000 : 3000)
      setPrimePanier(selectedEmployee.salaire_base > 50000 ? 2000 : 1500)
    }
    setCalculating(false)
  }

  const calculateIRG = (salaireBrut: number): number => {
    const salaireImposable = salaireBrut - (salaireBrut * 0.09)
    if (salaireImposable <= 30000) return 0
    if (salaireImposable <= 35000) return (salaireImposable - 30000) * 0.20
    if (salaireImposable <= 40000) return 1000 + (salaireImposable - 35000) * 0.23
    if (salaireImposable <= 80000) return 2150 + (salaireImposable - 40000) * 0.27
    if (salaireImposable <= 160000) return 12950 + (salaireImposable - 80000) * 0.30
    if (salaireImposable <= 320000) return 36950 + (salaireImposable - 160000) * 0.33
    return 89750 + (salaireImposable - 320000) * 0.35
  }

  const deductionAbsence = joursAbsence > 0 ? (salaireBase / 22) * joursAbsence : 0
  const totalPrimes = primeTransport + primeRendement + primePanier + (heuresSupp * tauxHoraire * 1.5)
  const salaireBrut = salaireBase + totalPrimes - deductionAbsence
  const cnasEmployee = salaireBrut * 0.09
  const cnasEmployer = salaireBrut * 0.26
  const irg = calculateIRG(salaireBrut)
  const salaireNet = salaireBrut - cnasEmployee - irg - retenues
  const coutTotal = salaireBrut + cnasEmployer
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount)

  const generateWithAI = async () => {
    if (!selectedEmployee) return
    setCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setPrimeTransport(selectedEmployee.salaire_base > 60000 ? 5000 : 3000)
    setPrimeRendement(Math.round(selectedEmployee.salaire_base * 0.05))
    setPrimePanier(selectedEmployee.salaire_base > 50000 ? 2000 : 1500)
    setCalculating(false)
  }

  const createPayslip = async () => {
    if (!selectedEmployee) { alert('Sélectionnez un employé'); return }
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/payslips/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id, month: selectedMonth, year: selectedYear,
          prime_transport: primeTransport, prime_rendement: primeRendement,
          heures_supp: heuresSupp * tauxHoraire * 1.5, retenues: retenues + deductionAbsence
        })
      })
      if (response.ok) alert('Bulletin de paie créé avec succès!')
      else { const data = await response.json(); alert(data.message || 'Erreur') }
    } catch { alert('Erreur de connexion') }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calculateur de Salaire Intelligent</h1>
          <p className="text-slate-500">Simulez et générez les bulletins avec IA et liaison pointage</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-3 py-2 border rounded-lg">
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg" />
        </div>
      </div>

      {/* Sélection Employé */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Sélectionner un Employé
          </h2>
          <span className="text-sm text-slate-500">{employees.length} employé(s) disponible(s)</span>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-slate-500">Chargement des employés...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg">
            <User className="w-16 h-16 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">Aucun employé trouvé</p>
            <p className="text-sm text-slate-500 mt-1">Veuillez d'abord ajouter des employés dans la section Employés</p>
            <a href="/dashboard/employees" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Ajouter un employé
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map(emp => (
              <div key={emp.id} onClick={() => handleEmployeeSelect(emp.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedEmployee?.id === emp.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${selectedEmployee?.id === emp.id ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                    {emp.first_name?.charAt(0) || '?'}{emp.last_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{emp.first_name} {emp.last_name}</p>
                    <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded inline-block">{emp.matricule}</p>
                    <p className="text-sm text-slate-500 truncate">{emp.position}</p>
                    {emp.department?.name && <p className="text-xs text-slate-400">{emp.department.name}</p>}
                    <p className="text-sm font-bold text-green-600 mt-1">{formatCurrency(emp.salaire_base)}</p>
                  </div>
                  {selectedEmployee?.id === emp.id && (
                    <div className="bg-blue-600 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Récapitulatif Employé Sélectionné */}
      {selectedEmployee && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
                <p className="text-blue-200">{selectedEmployee.position}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono">{selectedEmployee.matricule}</span>
                  {selectedEmployee.department?.name && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{selectedEmployee.department.name}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Salaire de Base</p>
              <p className="text-3xl font-bold">{formatCurrency(selectedEmployee.salaire_base)}</p>
              <p className="text-blue-200 text-sm mt-1">Taux horaire: {formatCurrency(tauxHoraire)}/h</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Pointage */}
      {selectedEmployee && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Données Pointage - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </h3>
          {attendanceStats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 rounded-lg p-4 text-center hover:bg-white/30 transition-all">
                  <p className="text-4xl font-bold">{attendanceStats.jours_travailles}</p>
                  <p className="text-sm opacity-80 mt-1">Jours travaillés</p>
                  <p className="text-xs opacity-60">sur 22 jours</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center hover:bg-white/30 transition-all">
                  <p className={`text-4xl font-bold ${attendanceStats.jours_absence > 3 ? 'text-red-300' : ''}`}>{attendanceStats.jours_absence}</p>
                  <p className="text-sm opacity-80 mt-1">Absences</p>
                  <p className="text-xs opacity-60">{attendanceStats.jours_absence > 0 ? `${formatCurrency((salaireBase / 22) * attendanceStats.jours_absence)} déduit` : 'Aucune'}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center hover:bg-white/30 transition-all">
                  <p className={`text-4xl font-bold ${attendanceStats.heures_supp > 0 ? 'text-green-300' : ''}`}>{attendanceStats.heures_supp}h</p>
                  <p className="text-sm opacity-80 mt-1">Heures Supp.</p>
                  <p className="text-xs opacity-60">{attendanceStats.heures_supp > 0 ? `+${formatCurrency(attendanceStats.heures_supp * tauxHoraire * 1.5)}` : 'Aucune'}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 text-center hover:bg-white/30 transition-all">
                  <p className={`text-4xl font-bold ${attendanceStats.retards > 3 ? 'text-yellow-300' : ''}`}>{attendanceStats.retards}</p>
                  <p className="text-sm opacity-80 mt-1">Retards</p>
                  <p className="text-xs opacity-60">{attendanceStats.retards > 0 ? 'À surveiller' : 'Ponctuel'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={runAIAnalysis} disabled={calculating}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50">
                  <Brain className="w-5 h-5" />
                  {calculating ? 'Analyse en cours...' : 'Analyser avec IA'}
                </button>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-sm opacity-80">Taux de présence:</span>
                  <span className="font-bold">{((attendanceStats.jours_travailles / 22) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="opacity-80">Aucune donnée de pointage pour cette période</p>
              <p className="text-sm opacity-60 mt-1">Les statistiques seront affichées une fois les pointages enregistrés</p>
            </div>
          )}
        </div>
      )}

      {/* Panneau Analyse IA */}
      {showAIPanel && aiAnalysis && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Analyse IA - Performance Employé
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">Score Performance</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{aiAnalysis.score_performance}%</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${aiAnalysis.score_performance}%` }}></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600 font-medium">Prime Suggérée</span>
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(aiAnalysis.prediction_prime)}</p>
              <p className="text-xs text-green-600 mt-1">Basée sur la performance</p>
            </div>
            <div className={`rounded-lg p-4 ${aiAnalysis.niveau_risque === 'low' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : aiAnalysis.niveau_risque === 'medium' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${aiAnalysis.niveau_risque === 'low' ? 'text-emerald-600' : aiAnalysis.niveau_risque === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>Niveau Risque</span>
                <AlertTriangle className={`w-4 h-4 ${aiAnalysis.niveau_risque === 'low' ? 'text-emerald-600' : aiAnalysis.niveau_risque === 'medium' ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
              <p className={`text-xl font-bold ${aiAnalysis.niveau_risque === 'low' ? 'text-emerald-700' : aiAnalysis.niveau_risque === 'medium' ? 'text-yellow-700' : 'text-red-700'}`}>
                {aiAnalysis.niveau_risque === 'low' ? 'Faible' : aiAnalysis.niveau_risque === 'medium' ? 'Moyen' : 'Élevé'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiAnalysis.recommandations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Recommandations
                </h4>
                <ul className="space-y-1">
                  {aiAnalysis.recommandations.map((r, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-400">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiAnalysis.anomalies.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Anomalies Détectées
                </h4>
                <ul className="space-y-1">
                  {aiAnalysis.anomalies.map((a, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-400">•</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-4 bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-slate-700 mb-2">Insights</h4>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.insights.map((insight, i) => (
                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm text-slate-600 border">{insight}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire Calcul */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Paramètres de Calcul
          </h3>
          <div className="space-y-4">
            {/* Salaire de Base */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Salaire de Base (DZD)
                <span className="text-xs text-slate-400 ml-2">Mensuel</span>
              </label>
              <div className="relative">
                <input type="number" value={salaireBase} onChange={(e) => setSalaireBase(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-16" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">DZD</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Taux horaire calculé: {formatCurrency(tauxHoraire)}/h (base 173.33h/mois)</p>
            </div>

            {/* Primes */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Primes et Indemnités
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prime Transport</label>
                  <input type="number" value={primeTransport} onChange={(e) => setPrimeTransport(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prime Rendement</label>
                  <input type="number" value={primeRendement} onChange={(e) => setPrimeRendement(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prime Panier</label>
                  <input type="number" value={primePanier} onChange={(e) => setPrimePanier(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Heures Supp. (h)</label>
                  <input type="number" value={heuresSupp} onChange={(e) => setHeuresSupp(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
                  {heuresSupp > 0 && <p className="text-xs text-green-600 mt-1">+{formatCurrency(heuresSupp * tauxHoraire * 1.5)} (×1.5)</p>}
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2 font-medium">Total Primes: +{formatCurrency(totalPrimes)}</p>
            </div>

            {/* Retenues */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Retenues et Déductions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jours Absence</label>
                  <input type="number" value={joursAbsence} onChange={(e) => setJoursAbsence(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-sm" min="0" max="22" />
                  {joursAbsence > 0 && <p className="text-xs text-red-600 mt-1">-{formatCurrency(deductionAbsence)}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Autres Retenues</label>
                  <input type="number" value={retenues} onChange={(e) => setRetenues(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
              </div>
              <p className="text-xs text-red-600 mt-2 font-medium">Total Retenues: -{formatCurrency(deductionAbsence + retenues)}</p>
            </div>

            {/* Bouton IA */}
            <button onClick={generateWithAI} disabled={!selectedEmployee || calculating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all">
              <Sparkles className="w-5 h-5" />
              {calculating ? 'Calcul en cours...' : 'Générer Primes avec IA'}
            </button>
            {!selectedEmployee && (
              <p className="text-xs text-center text-slate-400">Sélectionnez un employé pour activer le calcul IA</p>
            )}
          </div>
        </div>

        {/* Résultat Calcul */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Résultat du Calcul
            {selectedEmployee && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-auto">
                {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            )}
          </h3>
          
          <div className="space-y-2">
            {/* Section Gains */}
            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Gains</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Salaire de Base</span>
                  <span className="font-medium">{formatCurrency(salaireBase)}</span>
                </div>
                {primeTransport > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Prime Transport</span>
                    <span className="font-medium text-green-600">+{formatCurrency(primeTransport)}</span>
                  </div>
                )}
                {primeRendement > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Prime Rendement</span>
                    <span className="font-medium text-green-600">+{formatCurrency(primeRendement)}</span>
                  </div>
                )}
                {primePanier > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Prime Panier</span>
                    <span className="font-medium text-green-600">+{formatCurrency(primePanier)}</span>
                  </div>
                )}
                {heuresSupp > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Heures Supp. ({heuresSupp}h × {formatCurrency(tauxHoraire)} × 1.5)</span>
                    <span className="font-medium text-green-600">+{formatCurrency(heuresSupp * tauxHoraire * 1.5)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section Déductions */}
            {(joursAbsence > 0 || retenues > 0) && (
              <div className="bg-red-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-red-500 uppercase mb-2">Déductions</p>
                <div className="space-y-2">
                  {joursAbsence > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">Absences ({joursAbsence} jours × {formatCurrency(salaireBase / 22)})</span>
                      <span className="font-medium text-red-600">-{formatCurrency(deductionAbsence)}</span>
                    </div>
                  )}
                  {retenues > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">Autres Retenues</span>
                      <span className="font-medium text-red-600">-{formatCurrency(retenues)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Salaire Brut */}
            <div className="flex justify-between py-3 bg-blue-100 px-3 rounded-lg">
              <span className="text-blue-800 font-semibold">Salaire Brut</span>
              <span className="font-bold text-blue-800 text-lg">{formatCurrency(salaireBrut)}</span>
            </div>

            {/* Cotisations */}
            <div className="bg-orange-50 rounded-lg p-3 my-3">
              <p className="text-xs font-semibold text-orange-500 uppercase mb-2">Cotisations Sociales & Impôts</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">CNAS Employé (9%)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(cnasEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">IRG (Impôt sur le Revenu)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(irg)}</span>
                </div>
              </div>
            </div>

            {/* Salaire Net */}
            <div className="flex justify-between py-4 bg-gradient-to-r from-green-500 to-emerald-500 px-4 rounded-lg text-white">
              <div>
                <span className="font-bold text-lg">Salaire Net à Payer</span>
                <p className="text-xs text-green-100">Montant versé à l'employé</p>
              </div>
              <span className="font-bold text-2xl">{formatCurrency(salaireNet)}</span>
            </div>

            {/* Coût Employeur */}
            <div className="bg-slate-100 rounded-lg p-3 mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Coût Employeur</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Salaire Brut</span>
                  <span>{formatCurrency(salaireBrut)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">CNAS Employeur (26%)</span>
                  <span className="text-orange-600">+{formatCurrency(cnasEmployer)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Coût Total</span>
                  <span className="font-bold text-slate-800">{formatCurrency(coutTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton Générer */}
          <button onClick={createPayslip} disabled={!selectedEmployee}
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-green-200">
            <FileText className="w-5 h-5" />
            Générer Bulletin de Paie
          </button>
          {!selectedEmployee && (
            <p className="text-xs text-center text-slate-400 mt-2">Sélectionnez un employé pour générer le bulletin</p>
          )}
        </div>
      </div>
    </div>
  )
}