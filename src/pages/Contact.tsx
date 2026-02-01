import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Building2, 
  ArrowLeft,
  Clock,
  MessageSquare,
  CheckCircle,
  Users,
  Headphones
} from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    // Simuler l'envoi (à remplacer par un vrai appel API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+213 40 10 20 49',
      subContent: '+213 776 16 44 19',
      action: 'tel:+21340102049'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@rawatib.dz',
      subContent: 'support@rawatib.dz',
      action: 'mailto:contact@rawatib.dz'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: 'boulevard des lions, Residence Hasnaoui ',
      subContent: 'Oran, Algérie',
      action: 'https://maps.app.goo.gl/UnbL3zaabDoEkBeh9'
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: 'Dim - Jeu: 8h - 17h',
      subContent: 'Ven - Sam: Fermé',
      action: null
    }
  ]

  const reasons = [
    {
      icon: Headphones,
      title: 'Support Technique',
      description: 'Assistance pour l\'utilisation de la plateforme'
    },
    {
      icon: Users,
      title: 'Démonstration',
      description: 'Demander une démo personnalisée'
    },
    {
      icon: MessageSquare,
      title: 'Partenariat',
      description: 'Devenir partenaire ou revendeur'
    }
  ]

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Message envoyé !</h2>
          <p className="text-slate-600 mb-6">
            Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Retour à l'accueil
            </Link>
            <button 
              onClick={() => setSuccess(false)}
              className="block w-full border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Envoyer un autre message
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">RAWATIB</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-slate-600 hover:text-blue-600 transition">Accueil</Link>
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Connexion</Link>
              <Link to="/register" className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
                Essai Gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.action || '#'}
                className={`bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${!info.action ? 'cursor-default' : ''}`}
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <info.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{info.title}</h3>
                <p className="text-slate-600 text-sm">{info.content}</p>
                <p className="text-slate-500 text-sm">{info.subContent}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Envoyez-nous un message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.dz"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700">
                        Entreprise
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Nom de votre entreprise"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+213 XXX XXX XXX"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
                      Sujet
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="demo">Demande de démonstration</option>
                      <option value="support">Support technique</option>
                      <option value="sales">Question commerciale</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande..."
                      rows={5}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Why Contact Us */}
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pourquoi nous contacter ?</h3>
                <div className="space-y-4">
                  {reasons.map((reason, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <reason.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{reason.title}</h4>
                        <p className="text-sm text-slate-600">{reason.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Questions fréquentes</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="flex items-center gap-2 hover:underline">
                      → Comment fonctionne l'essai gratuit ?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 hover:underline">
                      → Quels sont les moyens de paiement ?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 hover:underline">
                      → Comment importer mes données ?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 hover:underline">
                      → Le support est-il inclus ?
                    </a>
                  </li>
                </ul>
              </div>

              {/* Response Time */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-6 w-6 text-green-600" />
                  <h3 className="font-bold text-green-800">Temps de réponse</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Notre équipe répond généralement sous <strong>24 heures</strong> les jours ouvrables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[21/9] bg-slate-200 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  boulevard des lions, Residence Hasnaoui, Oran, Algérie
                </p>
                <a 
                  href="https://maps.app.goo.gl/UnbL3zaabDoEkBeh9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2 font-medium"
                >
                  Voir sur Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RAWATIB</span>
          </Link>
          <p className="text-sm">© 2025 RAWATIB. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
