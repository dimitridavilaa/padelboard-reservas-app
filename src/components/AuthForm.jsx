import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/',
      },
    });
    if (error) {
      setMsg("❌ Error con Google: " + error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      } else {
        // --- REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        setMsg("✅ ¡Registro exitoso! Revisa tu correo para confirmar.");
      }
    } catch (error) {
      if (error.message.includes("Invalid login credentials")) {
        setMsg("❌ Correo o contraseña incorrectos.");
      } else {
        setMsg("❌ Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      
      {/* TABS (Pestañas) */}
      <div className="flex mb-8 bg-slate-100 p-1.5 rounded-xl">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            isLogin ? 'bg-white text-[#04133E] shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            !isLogin ? 'bg-white text-[#04133E] shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Registrarse
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#04133E] mb-1">
            {isLogin ? 'Inicia Sesión' : 'Crea tu cuenta'}
        </h2>
        <p className="text-slate-500 text-sm">
            {isLogin ? 'Ingresa para reservar tu cancha' : 'Únete a la comunidad y empieza a jugar'}
        </p>
      </div>

      {/* Google Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full mb-6 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        {isLogin ? 'Ingresar con Google' : 'Registrarse con Google'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wide"><span className="px-3 bg-white text-slate-400">O con email</span></div>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#04133E] focus:ring-2 focus:ring-[#3B82f6] focus:border-transparent outline-none font-medium transition-all"
              placeholder="Juan Pérez"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#04133E] focus:ring-2 focus:ring-[#3B82f6] focus:border-transparent outline-none font-medium transition-all"
            placeholder="juan@ejemplo.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-[#04133E] focus:ring-2 focus:ring-[#3B82f6] focus:border-transparent outline-none font-medium transition-all"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-[#3B82f6] focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#3B82f6] hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-2 hover:scale-[1.01]"
        >
          {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Crear Cuenta')}
        </button>

        {msg && <p className={`text-center text-sm mt-4 font-bold ${msg.includes('✅') ? 'text-[#3B82f6]' : 'text-red-500'}`}>{msg}</p>}
      </form>
    </div>
  );
}