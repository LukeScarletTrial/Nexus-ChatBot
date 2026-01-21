import React, { useState } from 'react';
import { signInWithGoogle, logInWithEmailAndPassword, registerWithEmailAndPassword } from '../services/firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await registerWithEmailAndPassword(email, password);
      } else {
        await logInWithEmailAndPassword(email, password);
      }
    } catch (err: any) {
      // Clean up Firebase error messages for display
      const msg = err.message || "Authentication failed";
      setError(msg.replace("Firebase: ", "").replace("auth/", ""));
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-nexus-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-secondary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nexus-accent/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 bg-nexus-panel/50 backdrop-blur-lg p-12 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center max-w-md w-full text-center">
        <div className="mb-6">
            <h1 className="text-5xl font-bold tracking-tighter text-white mb-2">NEXUS</h1>
            <p className="text-nexus-accent tracking-widest text-sm uppercase">Artificial Sentience Interface</p>
        </div>

        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          {isRegistering ? "Initialize new neural link." : "Access the neural network."}
        </p>

        {error && (
          <div className="w-full bg-red-900/30 border border-red-500/50 text-red-200 text-xs p-3 rounded mb-4">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-6">
            <input 
              type="email" 
              placeholder="Email Identity" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-nexus-dark/80 border border-nexus-panel text-white p-3 rounded focus:border-nexus-accent outline-none font-mono text-sm placeholder-gray-600 transition-colors"
              required
            />
            <input 
              type="password" 
              placeholder="Passcode" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-nexus-dark/80 border border-nexus-panel text-white p-3 rounded focus:border-nexus-accent outline-none font-mono text-sm placeholder-gray-600 transition-colors"
              required
            />
            
            <button 
              type="submit"
              className="w-full bg-nexus-secondary hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(112,0,255,0.3)]"
            >
              {isRegistering ? "ESTABLISH LINK" : "CONNECT"}
            </button>
        </form>

        <div className="relative w-full mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
                <span className="bg-[#171717] px-2 text-gray-500 uppercase tracking-widest">Or</span>
            </div>
        </div>

        <button 
          onClick={signInWithGoogle}
          className="w-full bg-white text-black hover:bg-gray-200 transition-colors font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-3 mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Authenticate with Google
        </button>

        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
          className="text-nexus-accent text-xs hover:text-white transition-colors uppercase tracking-wider"
        >
          {isRegistering ? "Return to Login Sequence" : "Initialize New Account"}
        </button>

        <div className="mt-8 text-xs text-nexus-dim font-mono">
            SECURE CONNECTION // ENCRYPTED
        </div>
      </div>
    </div>
  );
};

export default Login;