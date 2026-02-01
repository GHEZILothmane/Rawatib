import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calculator, 
  Users, 
  FileText, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Building2,
  Clock,
  PieChart,
  Zap,
  Star,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

export function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Calculator,
      title: 'Calcul Automatique',
      description: 'IRG, CNAS, CASNOS calculés automatiquement selon les barèmes algériens 2024'
    },
    {
      icon: FileText,
      title: 'Bulletins de Paie',
      description: 'Génération et export PDF des bulletins conformes à la réglementation'
    },
    {
      icon: Users,
      title: 'Gestion Employés',
      description: 'Suivi complet des employés, départements et contrats'
    },
    {
      icon: Clock,
      title: 'Pointage & Congés',
      description: 'Gestion des présences, absences et demandes de congés'
    },
    {
      icon: PieChart,
      title: 'Déclarations CNAS',
      description: 'Préparation automatique des déclarations sociales mensuelles'
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Données chiffrées et hébergées en Algérie'
    }
  ]

  const pricing = [
    {
      name: 'Starter',
      price: '9,900',
      period: '/mois',
      description: 'Pour les petites entreprises',
      features: ['Jusqu\'à 10 employés', 'Bulletins de paie', 'Support email', 'Calculs automatiques'],
      popular: false
    },
    {
      name: 'Business',
      price: '24,900',
      period: '/mois',
      description: 'Pour les PME',
      features: ['Jusqu\'à 50 employés', 'Toutes les fonctionnalités', 'Déclarations CNAS', 'Support prioritaire', 'Export Excel'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sur devis',
      period: '',
      description: 'Pour les grandes entreprises',
      features: ['Employés illimités', 'API personnalisée', 'Formation sur site', 'Account manager dédié', 'SLA garanti'],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: 'Karim Benali',
      role: 'DRH, SARL TechAlgérie',
      content: 'RAWATIB nous a fait gagner 3 jours par mois sur la gestion de la paie. Les calculs sont toujours justes.',
      rating: 5
    },
    {
      name: 'Fatima Khelifi',
      role: 'Comptable, Groupe Sonatrach',
      content: 'Enfin une solution qui comprend les spécificités algériennes. Les déclarations CNAS sont générées en un clic.',
      rating: 5
    },
    {
      name: 'Mohamed Saidi',
      role: 'Gérant, PME Oran',
      content: 'Interface simple et intuitive. Même sans formation RH, je gère facilement la paie de mes 15 employés.',
      rating: 5
    }
  ]

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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition">Fonctionnalités</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition">Tarifs</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition">Témoignages</a>
              <Link to="/contact" className="text-slate-600 hover:text-blue-600 transition">Contact</Link>
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Connexion</Link>
              <Link to="/register" className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
                Essai Gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-4">
            <a href="#features" className="block text-slate-600" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" className="block text-slate-600" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <a href="#testimonials" className="block text-slate-600" onClick={() => setMobileMenuOpen(false)}>Témoignages</a>
            <Link to="/contact" className="block text-slate-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link to="/login" className="block text-blue-600 font-medium">Connexion</Link>
            <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
              Essai Gratuit
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Conforme aux normes algériennes 2024
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Gestion des Salaires
            <span className="text-gradient block mt-2">Simplifiée pour l'Algérie</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Automatisez le calcul des salaires, générez vos bulletins de paie et 
            préparez vos déclarations CNAS en quelques clics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-gradient-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
              Commencer Gratuitement <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#features" className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition">
              Voir les fonctionnalités
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>14 jours d'essai gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Support en français</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une solution complète pour gérer la paie de votre entreprise en Algérie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gradient-primary transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Entreprises</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15K+</div>
              <div className="text-blue-100">Employés gérés</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Disponibilité</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-slate-600">
              Plus de 500 entreprises nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-slate-600">
              Choisissez le plan adapté à votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl p-8 transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : 'border hover:shadow-lg'}`}>
                {plan.popular && (
                  <div className="bg-gradient-primary text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Plus populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600">{plan.period}</span>
                  {plan.price !== 'Sur devis' && <span className="text-slate-500 text-sm block">DZD</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/register" 
                  className={`block text-center py-3 rounded-lg font-semibold transition ${
                    plan.popular 
                      ? 'bg-gradient-primary text-white hover:opacity-90' 
                      : 'border-2 border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  {plan.price === 'Sur devis' ? 'Nous contacter' : 'Commencer'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-primary rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full opacity-10"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full opacity-10"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à simplifier votre gestion de paie ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez plus de 500 entreprises algériennes qui nous font confiance
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">
              Démarrer l'essai gratuit <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RAWATIB</span>
              </Link>
              <p className="text-sm mb-4">
                Plateforme SaaS de gestion des salaires conforme aux normes algériennes.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+213 776 16 44 19</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@rawatib.dz</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Oran, Algérie</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">À propos</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition">Partenaires</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition">RGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 RAWATIB. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
