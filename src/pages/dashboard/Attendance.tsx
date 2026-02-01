import { useState, useEffect } from 'react'
import { Clock, UserCheck, UserX, Calendar, Filter, CheckCircle, XCircle, AlertCircle, Eye, X, TrendingUp, BarChart3, Users, Timer, Coffee, Briefcase } from 'lucide-react'

const API_URL = 'http://localhost:8000/api'

interface AttendanceRecord {
  id: number
  employee_id: number
  employee?: { first_name: string; last_name: string; position?: string; department?: { name: string } }
  date: string
  check_in: string | null
  check_out: string | null
  status: 'present' | 'absent' | 'late' | 'half_day'
  hours_worked: number
  notes: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  position?: string
  department?: { name: string }
}

const statusConfig = {
  present: { label: 'Présent', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  absent: { label: 'Absent', color: 'bg-red-100 text-red-700', icon: XCircle },
  late: { label: 'Retard', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  half_day: { label: 'Demi-journée', color: 'bg-blue-100 text-blue-700', icon: Clock }
}

export function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  useEffect(() => { loadData() }, [selectedDate])

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const [attRes, empRes] = await Promise.all([
        fetch(`${API_URL}/attendance?date=${selectedDate}`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
        fetch(`${API_URL}/employees`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
      ])
      if (attRes.ok) {
        const data = await attRes.json()
        setRecords(data.data || data || [])
      }
      if (empRes.ok) {
        const data = await empRes.json()
        setEmployees(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus)

  const stats = {
    total: employees.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length
  }

  const handleCheckIn = async (employeeId: number) => {
    try {
      const token = getToken()
      await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId, date: selectedDate, check_in: new Date().toTimeString().slice(0, 5) })
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  const handleCheckOut = async (recordId: number) => {
    try {
      const token = getToken()
      await fetch(`${API_URL}/attendance/${recordId}/check-out`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ check_out: new Date().toTimeString().slice(0, 5) })
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  const formatTime = (time: string | null) => time ? time.slice(0, 5) : '-'
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const openViewModal = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setShowViewModal(true)
  }

  // Calcul des statistiques avancées
  const totalHoursWorked = records.reduce((sum, r) => sum + (r.hours_worked || 0), 0)
  const avgHoursWorked = records.length > 0 ? (totalHoursWorked / records.filter(r => r.hours_worked > 0).length) : 0
  const presenceRate = employees.length > 0 ? ((stats.present + stats.late) / employees.length * 100) : 0
  const lateRate = records.length > 0 ? (stats.late / records.length * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pointage</h1>
          <p className="text-slate-500">Suivi des présences et heures de travail</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg" />
        </div>
      </div>

      <p className="text-lg font-medium text-slate-700">{formatDate(selectedDate)}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Effectif</p><p className="text-2xl font-bold">{stats.total}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><UserCheck className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-slate-500">Présents</p><p className="text-2xl font-bold text-green-600">{stats.present}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg"><UserX className="w-6 h-6 text-red-600" /></div>
          <div><p className="text-sm text-slate-500">Absents</p><p className="text-2xl font-bold text-red-600">{stats.absent}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg"><AlertCircle className="w-6 h-6 text-yellow-600" /></div>
          <div><p className="text-sm text-slate-500">Retards</p><p className="text-2xl font-bold text-yellow-600">{stats.late}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="font-semibold">Feuille de présence</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="all">Tous</option>
              <option value="present">Présents</option>
              <option value="absent">Absents</option>
              <option value="late">Retards</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Employé</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Arrivée</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Départ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Heures</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Aucun enregistrement pour cette date</td></tr>
              ) : (
                filtered.map((record) => {
                  const StatusIcon = statusConfig[record.status]?.icon || Clock
                  return (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{record.employee?.first_name} {record.employee?.last_name}</td>
                      <td className="px-4 py-3 text-green-600 font-mono">{formatTime(record.check_in)}</td>
                      <td className="px-4 py-3 text-red-600 font-mono">{formatTime(record.check_out)}</td>
                      <td className="px-4 py-3">{record.hours_worked ? `${record.hours_worked}h` : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[record.status]?.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[record.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openViewModal(record)} className="p-2 hover:bg-slate-100 rounded-lg" title="Voir détails">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </button>
                          {!record.check_out && record.check_in && (
                            <button onClick={() => handleCheckOut(record.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
                              Sortie
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Statistiques du Jour
          </h3>
          <button onClick={() => setShowStatsModal(true)} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg">
            Voir détails
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{presenceRate.toFixed(0)}%</p>
            <p className="text-xs opacity-80">Taux de présence</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <Timer className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{totalHoursWorked.toFixed(1)}h</p>
            <p className="text-xs opacity-80">Heures totales</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <Coffee className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{avgHoursWorked.toFixed(1)}h</p>
            <p className="text-xs opacity-80">Moyenne/employé</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold">{lateRate.toFixed(0)}%</p>
            <p className="text-xs opacity-80">Taux de retard</p>
          </div>
        </div>
      </div>

      {/* Quick check-in for employees without record */}
      {employees.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" /> Pointage rapide
          </h3>
          <div className="flex flex-wrap gap-2">
            {employees.filter(e => !records.find(r => r.employee_id === e.id)).map(emp => (
              <button key={emp.id} onClick={() => handleCheckIn(emp.id)}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm transition-all hover:shadow-md">
                <UserCheck className="w-4 h-4" />
                {emp.first_name} {emp.last_name}
              </button>
            ))}
          </div>
          {employees.filter(e => !records.find(r => r.employee_id === e.id)).length === 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Tous les employés ont pointé</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal - Détails du pointage */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Détails du Pointage</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* En-tête employé */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedRecord.employee?.first_name?.charAt(0)}{selectedRecord.employee?.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedRecord.employee?.first_name} {selectedRecord.employee?.last_name}</h3>
                    <p className="text-blue-200">{selectedRecord.employee?.position || 'Employé'}</p>
                    {selectedRecord.employee?.department?.name && (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs mt-1 inline-block">{selectedRecord.employee.department.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date et statut */}
              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedRecord.status]?.color}`}>
                  {statusConfig[selectedRecord.status]?.label}
                </span>
              </div>

              {/* Horaires */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Arrivée</p>
                  <p className="text-2xl font-bold text-green-700">{formatTime(selectedRecord.check_in)}</p>
                  {selectedRecord.status === 'late' && selectedRecord.check_in && (
                    <p className="text-xs text-orange-600 mt-1">Retard détecté</p>
                  )}
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Départ</p>
                  <p className="text-2xl font-bold text-red-700">{formatTime(selectedRecord.check_out)}</p>
                </div>
              </div>

              {/* Heures travaillées */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Heures travaillées</p>
                      <p className="text-2xl font-bold text-blue-700">{selectedRecord.hours_worked || 0}h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Objectif: 8h</p>
                    <div className="w-32 bg-blue-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((selectedRecord.hours_worked || 0) / 8 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Notes</p>
                  <p className="text-slate-600">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {!selectedRecord.check_out && selectedRecord.check_in && (
                  <button 
                    onClick={() => { handleCheckOut(selectedRecord.id); setShowViewModal(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Clock className="w-4 h-4" /> Enregistrer Sortie
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

      {/* Stats Modal - Statistiques détaillées */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowStatsModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Statistiques Détaillées</h2>
              <button onClick={() => setShowStatsModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center mb-4">
                <p className="text-slate-500">{formatDate(selectedDate)}</p>
              </div>

              {/* Répartition des statuts */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-4">Répartition des Statuts</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-slate-600">Présents</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-4">
                      <div className="bg-green-500 h-4 rounded-full" style={{ width: `${employees.length > 0 ? (stats.present / employees.length * 100) : 0}%` }}></div>
                    </div>
                    <div className="w-16 text-right font-medium text-green-600">{stats.present}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-slate-600">Retards</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-4">
                      <div className="bg-yellow-500 h-4 rounded-full" style={{ width: `${employees.length > 0 ? (stats.late / employees.length * 100) : 0}%` }}></div>
                    </div>
                    <div className="w-16 text-right font-medium text-yellow-600">{stats.late}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-slate-600">Absents</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-4">
                      <div className="bg-red-500 h-4 rounded-full" style={{ width: `${employees.length > 0 ? (stats.absent / employees.length * 100) : 0}%` }}></div>
                    </div>
                    <div className="w-16 text-right font-medium text-red-600">{stats.absent}</div>
                  </div>
                </div>
              </div>

              {/* Métriques clés */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{presenceRate.toFixed(1)}%</p>
                  <p className="text-sm text-green-700">Taux de présence</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{totalHoursWorked.toFixed(1)}h</p>
                  <p className="text-sm text-blue-700">Heures totales</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{avgHoursWorked.toFixed(1)}h</p>
                  <p className="text-sm text-purple-700">Moyenne par employé</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">{lateRate.toFixed(1)}%</p>
                  <p className="text-sm text-orange-700">Taux de retard</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button onClick={() => setShowStatsModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
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
