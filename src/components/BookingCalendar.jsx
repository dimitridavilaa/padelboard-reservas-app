import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// HORARIOS (Sincronizados con Admin: 07:00 - 22:00)
const TIME_SLOTS = [
  "07:00", "08:30", "10:00", "11:30",
  "13:00", "14:30", "16:00", "17:30",
  "19:00", "20:30", "22:00"
];

export default function BookingCalendar({ courtId }) {
  // Estado de fecha (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); 
  const [msg, setMsg] = useState("");

  // 1. EFECTO: Cargar ocupación al cambiar fecha
  useEffect(() => {
    fetchBookedSlots();
    setSelectedSlot(null);
    setMsg("");
  }, [selectedDate]);

  const fetchBookedSlots = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('court_id', courtId)
      .eq('date', selectedDate);

    if (error) {
      console.error("Error:", error);
    } else {
      const times = data.map(item => item.start_time.slice(0, 5));
      setBookedSlots(times);
    }
    setFetching(false);
  };

  // --- LOGICA DE FECHAS ---
  
  const changeDate = (days) => {
    // Truco para evitar problemas de zona horaria: crear fecha desde componentes
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    
    date.setDate(date.getDate() + days);
    
    // Formatear de vuelta a YYYY-MM-DD
    const newStr = date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
    
    setSelectedDate(newStr);
  };

  const getDateLabel = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const current = new Date(y, m - 1, d);
    const today = new Date();
    
    // Resetear horas de "today" para comparar solo fechas
    today.setHours(0,0,0,0);

    if (current.getTime() === today.getTime()) {
      return { text: "HOY", isToday: true };
    } else {
      // Formato ej: "Viernes, 28 Ene"
      const text = current.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
      return { text: text, isToday: false };
    }
  };

  const dateLabel = getDateLabel();

  // ------------------------

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + 90);
    return date.toTimeString().slice(0, 5);
  };

  const handleReserve = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setMsg("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMsg("❌ Debes iniciar sesión.");
        setLoading(false);
        return;
      }

      const endTime = getEndTime(selectedSlot);
      const { error } = await supabase
        .from('bookings')
        .insert({
          court_id: courtId,
          user_id: user.id,
          date: selectedDate,
          start_time: selectedSlot,
          end_time: endTime,
        });

      if (error) throw error;

      // Enviar Email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'confirmation',
            userEmail: user.email,     
            userName: user.email.split('@')[0], 
            date: selectedDate,
            time: selectedSlot,
            courtName: "Cancha Única"
          })
        });
      } catch (e) { console.error(e); }

      setMsg("✅ ¡Reserva confirmada!");
      fetchBookedSlots();
      setTimeout(() => { window.location.href = "/my-bookings"; }, 2000);

    } catch (error) {
      setMsg("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      {/* --- SELECTOR DE FECHA (Estilo Navy Clean) --- */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border-2 border-[#3B82f6]">
        
        {/* Flecha Izquierda (Blanca con borde Navy) */}
        <button 
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg bg-white text-[#04133E] border-2 border-white hover:bg-slate-50 transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Fecha Central y Calendar Picker */}
        <div className="flex flex-col items-center justify-center relative">
           {/* Input invisible para el calendario nativo */}
           <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            />
           
           <div className="flex items-center gap-2">
                {/* Icono Calendario */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#04133E]">
                  <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>

                {/* FECHA EN NÚMEROS (Ej: 29/01/2026) */}
                <span className="text-[#04133E] text-xl font-bold tracking-wide uppercase">
                   {selectedDate.split('-').reverse().join('/')}
                </span>
           </div>

            {/* ETIQUETA DINÁMICA (HOY vs OTRO DÍA) */}
            <span className={`
              mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all
              ${dateLabel.isToday 
                ? 'bg-[#3B82f6] text-white'       // Estilo para HOY (Navy)
                : 'bg-slate-100 text-slate-500'   // Estilo para OTROS DÍAS (Gris suave)
              }
            `}>
              {dateLabel.text}
            </span>
        </div>

        {/* Flecha Derecha (Blanca con borde Navy) */}
        <button 
          onClick={() => changeDate(1)}
          className="p-2 rounded-lg bg-white text-[#04133E] border-2 border-white hover:bg-slate-50 transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      {/* ------------------------------------------- */}


      {/* Grilla de Horarios */}
      <div className="relative">
        <p className="block text-gray-400 mb-3 text-sm font-medium flex justify-between items-center">
          <span>Horarios disponibles:</span>
          {fetching && <span className="text-[#3B82f6] text-xs animate-pulse">Actualizando...</span>}
        </p>
        
        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 ${fetching ? 'opacity-50 pointer-events-none' : ''}`}>
          {TIME_SLOTS.map((time) => {
            const isBooked = bookedSlots.includes(time);

            return (
              <button
                key={time}
                onClick={() => !isBooked && setSelectedSlot(time)}
                disabled={isBooked}
                className={`
                  py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 relative flex flex-col items-center justify-center gap-1 shadow-sm
                  ${isBooked 
                    ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed' // ⛔ OCUPADO (Gris suave)
                    : selectedSlot === time 
                      ? 'bg-[#3B82f6] border-[#3B82f6] text-white scale-105 shadow-md' // ✅ SELECCIONADO (Azul Naval)
                      : 'bg-white text-slate-700 border-slate-100 hover:border-[#3B82f6] hover:text-[#3B82f6] hover:shadow-md' // ⬜ LIBRE (Blanco limpio)
                  }
                `}
              >
                <span>{time}</span>
                {/* Icono pequeño si está ocupado */}
                {isBooked && (
                  <span className="text-[10px] text-red-400/70 font-normal">Ocupado</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen y Botón Confirmar */}
      {selectedSlot && (
        <div className="mt-4 p-6 bg-white border border-slate-200 rounded-xl shadow-lg animate-fade-in text-center">
          <h3 className="text-[#04133E] text-lg font-bold mb-2">Resumen de Reserva</h3>
          <p className="text-slate-500 mb-6">
          Jugarás el <span className="text-[#04133E] font-bold capitalize">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span> <br/>
            de <span className="text-white bg-[#3B82f6] px-2 py-0.5 rounded">{selectedSlot}</span> a <span className="text-white bg-[#3B82f6] px-2 py-0.5 rounded">{getEndTime(selectedSlot)}</span>
          </p>
          
          <button
            onClick={handleReserve}
            disabled={loading}
            className="w-full bg-[#3B82f6] hover:bg-blue-600 text-white text-slate-900 font-extrabold py-4 rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-[#04133E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'CONFIRMAR RESERVA'}
          </button>

          {msg && <p className="mt-4 text-sm font-bold text-white bg-slate-700/50 py-2 rounded animate-pulse">{msg}</p>}
        </div>
      )}
    </div>
  );
}