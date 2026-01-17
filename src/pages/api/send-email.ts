export const prerender = false; // Importante: Se ejecuta en el servidor
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { userEmail, userName, date, time, courtName } = body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Club Naval Padel <notificaciones@reservas.getpadelboard.com>', 
      to: [userEmail],
      subject: '🎾 ¡Reserva Confirmada! - Club Naval Padel',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4ade80;">¡Partido Confirmado! 🎾</h1>
          <p>Hola <strong>${userName || 'Jugador'}</strong>,</p>
          <p>Tu reserva ha sido registrada con éxito. Aquí tienes los detalles:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;">📅 <strong>Fecha:</strong> ${date}</p>
            <p style="margin: 5px 0;">⏰ <strong>Hora:</strong> ${time}</p>
            <p style="margin: 5px 0;">📍 <strong>Cancha:</strong> ${courtName}</p>
          </div>

          <p>Recuerda que puedes cancelar hasta 24 horas antes desde la sección "Mis Reservas".</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Nos vemos en la cancha,<br>El equipo de Padel Club</p>
        </div>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Email enviado" }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};