import React, { useState } from 'react';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSubmit: (email: string, password: string, username?: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && password !== confirmPassword) {
      alert('Passwörter stimmen nicht überein!');
      return;
    }

    onSubmit(email, password, username);
  };

  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-br from-elf-dark via-elf-wood/20 to-elf-dark border border-elf-wood/30 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-elf-white/60 hover:text-elf-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-elf-red to-elf-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🎅</span>
          </div>
          <h2 className="text-3xl font-bold text-elf-white mb-2">
            {isLogin ? 'Willkommen zurück!' : 'Werkstatt erstellen'}
          </h2>
          <p className="text-elf-white/70">
            {isLogin
              ? 'Melde dich an, um fortzufahren'
              : 'Erstelle deine private Wichtel-Werkstatt'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-elf-white/90 font-medium mb-2">
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-elf-dark/60 border border-elf-wood/40 rounded-lg text-elf-white placeholder-elf-white/40 focus:outline-none focus:border-elf-gold/60 focus:ring-2 focus:ring-elf-gold/20 transition-all"
                placeholder="Dein Name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-elf-white/90 font-medium mb-2">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-elf-dark/60 border border-elf-wood/40 rounded-lg text-elf-white placeholder-elf-white/40 focus:outline-none focus:border-elf-gold/60 focus:ring-2 focus:ring-elf-gold/20 transition-all"
              placeholder="deine@email.de"
              required
            />
          </div>

          <div>
            <label className="block text-elf-white/90 font-medium mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-elf-dark/60 border border-elf-wood/40 rounded-lg text-elf-white placeholder-elf-white/40 focus:outline-none focus:border-elf-gold/60 focus:ring-2 focus:ring-elf-gold/20 transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-elf-white/90 font-medium mb-2">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-elf-dark/60 border border-elf-wood/40 rounded-lg text-elf-white placeholder-elf-white/40 focus:outline-none focus:border-elf-gold/60 focus:ring-2 focus:ring-elf-gold/20 transition-all"
                placeholder="••••••••"
                required={!isLogin}
                minLength={6}
              />
            </div>
          )}

          {/* Privacy Notice for Registration */}
          {!isLogin && (
            <div className="flex items-start space-x-2 p-4 bg-elf-gold/10 border border-elf-gold/30 rounded-lg">
              <svg className="w-5 h-5 text-elf-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-elf-white/80 text-sm">
                Deine Wichtel-Werkstatt ist 100% privat. Niemand außer dir kann sie sehen.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-lg hover:shadow-xl hover:shadow-elf-gold/20 hover:scale-105 transition-all duration-300 font-bold text-lg"
          >
            {isLogin ? 'Anmelden' : 'Werkstatt erstellen'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm text-elf-white/70">
          {isLogin ? (
            <>
              Noch keine Werkstatt?{' '}
              <button
                onClick={onClose}
                className="text-elf-gold hover:text-elf-white font-medium transition-colors"
              >
                Jetzt registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              <button
                onClick={onClose}
                className="text-elf-gold hover:text-elf-white font-medium transition-colors"
              >
                Zur Anmeldung
              </button>
            </>
          )}
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-elf-green/10 border border-elf-green/30 rounded-lg text-center">
          <p className="text-elf-white/60 text-xs">
            Demo-Modus: Nutze beliebige Daten zum Testen
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
