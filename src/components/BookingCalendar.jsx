import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Horarios fijos
const TIME_SLOTS = [
  "09:00", "10:30", "12:00", "13:30", 
  "15:00", "16:30", "18:00", "19:30", "21:00"
];

export default function BookingCalendar({ courtId }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]); // Nuevo estado: Horas ocupadas
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // Para mostrar carga al cambiar fecha
  const [msg, setMsg] = useState("");

  // 1. EFECTO: Cada vez que cambia la FECHA, consultamos qué horas están ocupadas
  useEffect(() => {
    fetchBookedSlots();
    setSelectedSlot(null); // Reseteamos la selección al cambiar de día
    setMsg("");
  }, [selectedDate]);

  const fetchBookedSlots = async () => {
    setFetching(true);
    // Consultamos solo las horas de inicio de las reservas de ESA cancha y ESA fecha
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('court_id', courtId)
      .eq('date', selectedDate);

    if (error) {
      console.error("Error cargando horarios:", error);
    } else {
      // Supabase devuelve ej: [{start_time: "18:00:00"}, {start_time: "09:00:00"}]
      // Lo convertimos a una lista simple: ["18:00", "09:00"]
      const times = data.map(item => item.start_time.slice(0, 5));
      setBookedSlots(times);
    }
    setFetching(false);
  };

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
      // 1. Obtener usuario
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMsg("❌ Error: Debes iniciar sesión.");
        setLoading(false);
        return;
      }

      // 2. Insertar Reserva en Base de Datos
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

      // --- NUEVO: ENVIAR EMAIL DE CONFIRMACIÓN ---
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,     // A quién enviamos
            userName: user.email.split('@')[0], // Un nombre improvisado
            date: selectedDate,
            time: selectedSlot,
            courtName: "Cancha Única"
          })
        });
        console.log("📨 Email de confirmación enviado");
      } catch (mailError) {
        console.error("Error enviando email (pero la reserva se guardó):", mailError);
        // No bloqueamos el flujo si falla el email
      }
      // -------------------------------------------

      setMsg("✅ ¡Reserva confirmada! Te llegará un correo.");
      fetchBookedSlots();
      
      setTimeout(() => {
        window.location.href = "/my-bookings"; // Te llevo a "Mis Reservas"
      }, 2000);

    } catch (error) {
      setMsg("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de Fecha */}
      <div>
        <label className="block text-gray-400 mb-2 text-sm font-medium">Fecha del partido:</label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-900 border border-slate-600 text-white rounded p-2 w-full md:w-auto focus:border-green-500 outline-none color-scheme-dark"
        />
      </div>

      {/* Grilla de Horarios */}
      <div className="relative">
        <p className="block text-gray-400 mb-2 text-sm font-medium flex justify-between">
          <span>Horarios (90 min):</span>
          {fetching && <span className="text-yellow-400 text-xs animate-pulse">Cargando disponibilidad...</span>}
        </p>
        
        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 ${fetching ? 'opacity-50 pointer-events-none' : ''}`}>
          {TIME_SLOTS.map((time) => {
            // Verificamos si la hora está ocupada
            const isBooked = bookedSlots.includes(time);

            return (
              <button
                key={time}
                onClick={() => !isBooked && setSelectedSlot(time)}
                disabled={isBooked} // Desactiva el botón HTML
                className={`
                  py-2 px-4 rounded text-sm font-semibold transition border relative
                  ${isBooked 
                    ? 'bg-red-900/20 text-red-500/50 border-red-900/30 cursor-not-allowed line-through' // Estilo Ocupado
                    : selectedSlot === time 
                      ? 'bg-green-500 text-slate-900 border-green-500 scale-105 shadow-lg' // Estilo Seleccionado
                      : 'bg-slate-700 text-slate-200 border-slate-600 hover:border-green-400 hover:text-green-400' // Estilo Libre
                  }
                `}
              >
                {time}
                {isBooked && <span className="sr-only">(Ocupado)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      {selectedSlot && (
        <div className="mt-6 p-4 bg-slate-700/50 border border-green-500/30 rounded-lg animate-fade-in">
          <p className="text-green-400 mb-4 text-center">
            Reservar cancha para el <strong>{selectedDate}</strong> <br/>
            de <strong>{selectedSlot}</strong> a <strong>{getEndTime(selectedSlot)}</strong>
          </p>
          
          <button
            onClick={handleReserve}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-3 rounded transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
          </button>

          {msg && <p className="text-center mt-3 text-sm font-bold text-white">{msg}</p>}
        </div>
      )}
    </div>
  );
}