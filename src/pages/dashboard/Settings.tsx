import { useState, useEffect } from 'react'
import { User, Building2, Lock, Bell, Save, CheckCircle } from 'lucide-react'

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState({ name: '', email: '', role: '' })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        // ignore
      }
    }
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('user', JSON.stringify(user))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setPasswords({ current: '', new: '', confirm: '' })
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Entreprise', icon: Building2 },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500">Gérez vos préférences et paramètres</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Modifications enregistrées avec succès
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        {/* Tabs */}
        <div className="border-b flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <h2 className="text-lg font-semibold text-slate-800">Informations du profil</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{user.name || 'Utilisateur'}</p>
                  <p className="text-sm text-slate-500">{user.role || 'Membre'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-lg font-semibold text-slate-800">Informations de l'entreprise</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                <input type="text" defaultValue="SARL TechAlgérie" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input type="text" defaultValue="123 Rue Didouche Mourad, Alger" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIF</label>
                  <input type="text" defaultValue="001234567890123" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
                  <input type="text" defaultValue="001234567890" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">N° CNAS</label>
                <input type="text" defaultValue="CNAS-ALG-001234" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
              <h2 className="text-lg font-semibold text-slate-800">Changer le mot de passe</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {saving ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-lg font-semibold text-slate-800">Préférences de notifications</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Nouveaux bulletins de paie', desc: 'Recevoir une notification quand un bulletin est généré' },
                  { label: 'Demandes de congés', desc: 'Être notifié des nouvelles demandes de congés' },
                  { label: 'Rappels de déclarations', desc: 'Rappels avant les échéances CNAS' },
                  { label: 'Mises à jour système', desc: 'Informations sur les nouvelles fonctionnalités' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
