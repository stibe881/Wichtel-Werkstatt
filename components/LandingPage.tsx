import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elf-dark via-[#3d2820] to-elf-dark">
      {/* Header */}
      <header className="bg-elf-dark/80 backdrop-blur-sm border-b border-elf-wood/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-elf-red to-elf-green rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg sm:text-xl">🎅</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-elf-gold via-elf-white to-elf-gold bg-clip-text text-transparent">
                Wichtel-Werkstatt
              </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={onLogin}
                className="px-3 py-1 sm:px-4 sm:py-1.5 text-elf-white hover:text-elf-gold transition-colors font-medium text-xs sm:text-sm"
              >
                Anmelden
              </button>
              <button
                onClick={onRegister}
                className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-md hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium text-xs sm:text-sm"
              >
                Registrieren
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-winter opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <div className="text-center space-y-5 sm:space-y-8">
            <div className="inline-block">
              <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-elf-gold rounded-full animate-pulse"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-elf-gold rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-elf-gold rounded-full animate-pulse delay-150"></div>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-elf-white leading-tight px-2">
              Deine private{' '}
              <span className="bg-gradient-to-r from-elf-red via-elf-gold to-elf-green bg-clip-text text-transparent">
                Wichtel-Plattform
              </span>
            </h2>

            <p className="text-lg sm:text-xl lg:text-2xl text-elf-white/80 max-w-3xl mx-auto leading-relaxed px-3">
              Plane und organisiere magische Wichtel-Momente für deine Familie, Freunde oder Teams.
              <br className="hidden sm:block" />
              <span className="text-elf-gold font-medium">Privat. Persönlich. Perfekt organisiert.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-8 px-3">
              <button
                onClick={onRegister}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-xl hover:shadow-2xl hover:shadow-elf-gold/20 hover:scale-105 transition-all duration-300 font-bold text-base sm:text-lg w-full sm:w-auto"
              >
                <span className="relative z-10">Jetzt starten</span>
                <div className="absolute inset-0 bg-gradient-to-r from-elf-green to-elf-red opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>

              <button
                onClick={onLogin}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-elf-wood/30 backdrop-blur-sm text-elf-white border-2 border-elf-wood/50 rounded-xl hover:bg-elf-wood/50 hover:border-elf-gold/50 hover:scale-105 transition-all duration-300 font-bold text-base sm:text-lg w-full sm:w-auto"
              >
                Zur Anmeldung
              </button>
            </div>

            {/* Privacy Badge */}
            <div className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-elf-dark/60 backdrop-blur-sm rounded-full border border-elf-wood/30 mt-4 sm:mt-8 mx-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-elf-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-elf-white/80 text-xs sm:text-sm font-medium">
                100% privat – Nur du siehst deine Wichtel-Werkstatt
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Feature 1 */}
          <div className="group relative bg-gradient-to-br from-elf-wood/20 to-elf-dark/60 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-elf-wood/30 hover:border-elf-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-elf-gold/10">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-elf-gold/5 rounded-full blur-3xl group-hover:bg-elf-gold/10 transition-all"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-elf-red to-elf-green rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:shadow-elf-gold/30 transition-all">
                <span className="text-2xl sm:text-3xl">🎄</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-elf-white mb-2 sm:mb-3">
                Magische Ideen
              </h3>
              <p className="text-sm sm:text-base text-elf-white/70 leading-relaxed">
                Zugriff auf hunderte kreative Wichtel-Ideen, KI-generierte Vorschläge und deinen persönlichen Ideenspeicher.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-gradient-to-br from-elf-wood/20 to-elf-dark/60 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-elf-wood/30 hover:border-elf-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-elf-gold/10">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-elf-gold/5 rounded-full blur-3xl group-hover:bg-elf-gold/10 transition-all"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-elf-green to-elf-red rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:shadow-elf-gold/30 transition-all">
                <span className="text-2xl sm:text-3xl">📅</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-elf-white mb-2 sm:mb-3">
                Perfekte Planung
              </h3>
              <p className="text-sm sm:text-base text-elf-white/70 leading-relaxed">
                Interaktiver Adventskalender, automatische Einkaufslisten und Erinnerungen für stressfreie Vorbereitung.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-gradient-to-br from-elf-wood/20 to-elf-dark/60 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-elf-wood/30 hover:border-elf-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-elf-gold/10">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-elf-gold/5 rounded-full blur-3xl group-hover:bg-elf-gold/10 transition-all"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-elf-gold to-elf-red rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:shadow-elf-gold/30 transition-all">
                <span className="text-2xl sm:text-3xl">🔒</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-elf-white mb-2 sm:mb-3">
                100% Privat
              </h3>
              <p className="text-sm sm:text-base text-elf-white/70 leading-relaxed">
                Jede Wichtel-Werkstatt ist vollständig privat. Andere Nutzer können deine Daten niemals einsehen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="relative bg-gradient-to-br from-elf-red/20 via-elf-green/20 to-elf-gold/20 backdrop-blur-sm rounded-3xl p-6 sm:p-12 border border-elf-gold/30 text-center">
          <div className="absolute inset-0 bg-winter opacity-5 rounded-3xl"></div>
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-elf-white mb-3 sm:mb-4 px-2">
              Bereit für dein Wichtel-Abenteuer?
            </h3>
            <p className="text-base sm:text-xl text-elf-white/80 mb-6 sm:mb-8 px-2">
              Erstelle deine private Wichtel-Werkstatt in weniger als 2 Minuten.
            </p>
            <button
              onClick={onRegister}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-xl hover:shadow-2xl hover:shadow-elf-gold/30 hover:scale-105 transition-all duration-300 font-bold text-lg sm:text-xl w-full sm:w-auto"
            >
              <span className="relative z-10">Kostenlos registrieren</span>
              <div className="absolute inset-0 bg-gradient-to-r from-elf-green to-elf-red opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-elf-wood/20 bg-elf-dark/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
            <p className="text-elf-white/60 text-xs sm:text-sm text-center md:text-left">
              © 2025 Wichtel-Werkstatt. Made with ❤️ for magical moments.
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-elf-white/60">
              <a href="#" className="hover:text-elf-gold transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-elf-gold transition-colors">Impressum</a>
              <a href="#" className="hover:text-elf-gold transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
