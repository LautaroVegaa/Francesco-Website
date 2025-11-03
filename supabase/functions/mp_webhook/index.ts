// EN: supabase/functions/mp_webhook/index.ts
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Inicia el cliente de Supabase (Admin)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
);

// Obtenemos los tokens del entorno
const MP_ACCESS_TOKEN = Deno.env.get('ACCESS_TOKEN');

// --- ¡CAMBIO 1: Añadimos Resend! ---
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// IMPORTANTE: Cambia esto al email que verificaste en Resend
const SENDER_EMAIL = 'noreply@francescoretratos.com';

// --- ¡NUEVO! Email de Francesco (donde RECIBE la notificación) ---
const FRANCESCO_EMAIL = 'francescoponte185@gmail.com';

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();

    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      
      const mpPaymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      });

      if (!mpPaymentResponse.ok) {
        throw new Error(`Error al obtener el pago desde MP: ${mpPaymentResponse.statusText}`);
      }
      const mpPayment = await mpPaymentResponse.json();

      if (mpPayment && mpPayment.status === 'approved') {
        
        const userId = mpPayment.metadata?.user_id;
        const items = mpPayment.metadata?.items;
        
        if (!userId) {
          throw new Error('No se encontró user_id en la metadata del pago');
        }

        // --- ¡CAMBIO 2: Buscamos los datos del usuario (email y nombre)! ---
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userError) {
            console.error('Error al buscar usuario para email:', userError);
            throw userError;
        }

        const userEmail = user.email;
        const userName = user.user_metadata?.full_name || user.email.split('@')[0];
        // --- Fin Cambio 2 ---


        // Preparamos los datos para nuestra tabla "pedidos"
        const newOrder = {
          user_id: userId,
          items: items || [],
          total_amount: Math.round(mpPayment.transaction_amount * 100), 
          payment_status: 'approved',
          mp_payment_id: paymentId,
        };

        // Guardamos en la tabla "pedidos"
        const { error } = await supabaseAdmin
          .from('pedidos')
          .insert(newOrder);

        if (error) {
          console.error('Error al guardar en Supabase:', error);
          throw error;
        }
        
        console.log('Pedido registrado con éxito:', newOrder);

        // --- ¡CAMBIO 3: Enviamos el email de confirmación! ---
        // Lo ponemos en un try/catch separado para que si falla el email,
        // NO falle la respuesta 200 a Mercado Pago.
        try {
            // 1. Formateamos los items para el HTML del email
            const itemsHtml = newOrder.items.map((item: any) => 
                `<li>${item.title} (x${item.quantity}) - $${item.unit_price} ARS</li>`
            ).join('');

            // 2. Formateamos el total
            const totalArs = (newOrder.total_amount / 100).toLocaleString('es-AR');
            
            // 3. Creamos el cuerpo del email
            const emailHtml = `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>¡Gracias por tu compra, ${userName}!</h2>
                  <p>Tu pago fue procesado con éxito y tu pedido ya está confirmado.</p>
                  <h3>Detalles del Pedido:</h3>
                  <ul>
                    ${itemsHtml}
                  </ul>
                  <p><strong>Total pagado: $${totalArs} ARS</strong></p>
                  <p>ID de la transacción: ${newOrder.mp_payment_id}</p>
                  <hr>
                  <p>Podes ver tu historial de compras en cualquier momento ingresando a tu cuenta en <a href="https://www.francescoretratos.com/historial.html">francescoretratos.com</a>.</p>
                </body>
              </html>
            `;

            // 4. Enviamos la petición a Resend
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: `Francesco Ponte <${SENDER_EMAIL}>`,
                    to: [userEmail],
                    subject: `¡Confirmación de tu pedido en Francesco Retratos!`,
                    html: emailHtml
                })
            });

            if (resendResponse.ok) {
                console.log('Email de confirmación enviado a:', userEmail);
            } else {
                console.warn('Pedido guardado, pero falló el envío de email:', await resendResponse.json());
            }

        } catch (emailError) {
            console.error('Error catastrófico al enviar email:', emailError.message);
        }
        // --- Fin Cambio 3 ---
      }
    }

    // Devolvemos 200 OK a Mercado Pago
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error en el webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400, 
    });
  }
});