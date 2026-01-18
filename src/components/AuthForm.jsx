import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Datos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/my-bookings', 
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
        window.location.href = "/my-bookings";
      } else {
        // --- REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
        setMsg("✅ ¡Registro exitoso! Revisa tu correo para confirmar.");
      }
    } catch (error) {
      setMsg("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
      
      {/* TABS */}
      <div className="flex mb-6 bg-slate-700 p-1 rounded-lg">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            isLogin ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            !isLogin ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Registrarse
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-2">
        {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
      </h2>
      <p className="text-slate-400 text-center mb-6 text-sm">
        {isLogin ? 'Ingresa para reservar tu cancha' : 'Únete al club y empieza a jugar'}
      </p>

      {/* Google Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full mb-6 flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        {isLogin ? 'Ingresar con Google' : 'Registrarse con Google'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-600"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-slate-800 text-slate-500">O con email</span></div>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        
        {/* Solo pedimos Nombre en Registro */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
              placeholder="Juan Pérez"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
            placeholder="juan@ejemplo.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Input Contraseña con Ojito */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-2 text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white focus:outline-none"
            >
              {showPassword ? (
                // Icono Ojo Abierto
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                // Icono Ojo Cerrado (Tachado)
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
          className="w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-3 rounded-lg transition-colors mt-2"
        >
          {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Crear Cuenta')}
        </button>

        {msg && <p className="text-center text-sm mt-4 text-yellow-400">{msg}</p>}
      </form>
    </div>
  );
}