import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, UserPlus, Building2, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Tous les champs sont obligatoires')
      return false
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        // Rediriger vers le dashboard
        window.location.href = '/dashboard'
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0]
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
        } else {
          setError(data.message || 'Erreur lors de l\'inscription')
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const pwd = formData.password
    if (pwd.length === 0) return { level: 0, text: '', color: '' }
    if (pwd.length < 6) return { level: 1, text: 'Faible', color: 'bg-red-500' }
    if (pwd.length < 8) return { level: 2, text: 'Moyen', color: 'bg-yellow-500' }
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { level: 4, text: 'Fort', color: 'bg-green-500' }
    return { level: 3, text: 'Bon', color: 'bg-blue-500' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
            <p className="text-slate-500 mt-2">Commencez votre essai gratuit de 14 jours</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ahmed Benali"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.dz"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Force: {strength.text}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
                {formData.password_confirmation && formData.password === formData.password_confirmation && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                J'accepte les{' '}
                <a href="#" className="text-blue-600 hover:underline">conditions d'utilisation</a>
                {' '}et la{' '}
                <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">Inclus dans l'essai gratuit :</p>
            <ul className="text-xs text-green-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> 14 jours d'accès complet
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Jusqu'à 10 employés
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Sans carte bancaire
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
