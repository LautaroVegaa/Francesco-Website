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
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Email verificado en Resend (el que usamos para ENVIAR)
const SENDER_EMAIL = 'noreply@francescoretratos.com'; 

// --- ¡NUEVO! Email de Francesco (donde RECIBE la notificación) ---
// --- (Asegúrate de que este sea el email correcto de tu cliente) ---
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
        
        // --- ¡AQUÍ LEEMOS TODOS LOS DATOS! ---
        const userId = mpPayment.metadata?.user_id;
        const items = mpPayment.metadata?.items;
        const shippingAddress = mpPayment.metadata?.shipping_address; // <-- ¡AÑADIDO!
        
        if (!userId) {
          throw new Error('No se encontró user_id en la metadata del pago');
        }

        // --- Buscamos los datos del CLIENTE (Comprador) ---
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError) {
            console.error('Error al buscar usuario para email:', userError);
            throw userError;
        }
        const userEmail = user.email; // Email del comprador
        const userName = user.user_metadata?.full_name || user.email.split('@')[0]; // Nombre del comprador
        // --- Fin Búsqueda ---

        // --- ¡AQUÍ PREPARAMOS EL PEDIDO COMPLETO! ---
        const newOrder = {
          user_id: userId,
          items: items || [],
          total_amount: Math.round(mpPayment.transaction_amount * 100), 
          payment_status: 'approved',
          mp_payment_id: paymentId,
          shipping_address: shippingAddress // <-- ¡AÑADIDO!
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

        // --- Preparamos los datos comunes para los emails ---
        const itemsHtml = newOrder.items.map((item: any) => 
            `<li>${item.title} (x${item.quantity}) - $${item.unit_price} ARS</li>`
        ).join('');
        const totalArs = (newOrder.total_amount / 100).toLocaleString('es-AR');
        
        let shippingHtml = '<h3>El cliente no proveyó dirección de envío.</h3>'; // Fallback
        if (shippingAddress) {
            shippingHtml = `
              <h3>Datos de Envío:</h3>
              <p>
                ${shippingAddress.address || ''}<br>
                ${shippingAddress.postalcode || ''} ${shippingAddress.city || ''}<br>
                ${shippingAddress.province || ''}
              </p>
            `;
        }
        // --- Fin datos comunes ---


        // --- CAMBIO 3: Email de confirmación al CLIENTE (Comprador) ---
        try {
            const emailHtmlCliente = `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>¡Gracias por tu compra, ${userName}!</h2>
                  <p>Tu pago fue procesado con éxito y tu pedido ya está confirmado.</p>
                  <h3>Detalles del Pedido:</h3>
                  <ul>${itemsHtml}</ul>
                  <p><strong>Total pagado: $${totalArs} ARS</strong></p>
                  
                  ${shippingHtml} <hr>
                  <p>ID de la transacción: ${newOrder.mp_payment_id}</p>
                  <p>Podes ver tu historial de compras en <a href="https://www.francescoretratos.com/historial.html">francescoretratos.com</a>.</p>
                </body>
              </html>
            `;

            const resendResponseCliente = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: `Francesco Ponte <${SENDER_EMAIL}>`,
                    to: [userEmail], // Se envía al comprador
                    subject: `¡Confirmación de tu pedido en Francesco Retratos!`,
                    html: emailHtmlCliente
                })
            });
            if (resendResponseCliente.ok) console.log('Email de confirmación enviado a:', userEmail);
            else console.warn('Pedido guardado, pero falló el envío de email al CLIENTE:', await resendResponseCliente.json());

        } catch (emailError) {
            console.error('Error catastrófico al enviar email al CLIENTE:', emailError.message);
        }
        // --- Fin Email Cliente ---


        // --- ¡CAMBIO 4: AÑADIMOS EMAIL PARA FRANCESCO! (Vendedor) ---
        try {
            const emailHtmlVendedor = `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>¡Felicitaciones, tuviste una nueva venta!</h2>
                  <p>Has recibido un nuevo pedido de: <strong>${userName}</strong> (${userEmail})</p>
                  
                  <h3>Items del Pedido:</h3>
                  <ul>${itemsHtml}</ul>
                  <p><strong>Total cobrado: $${totalArs} ARS</strong></p>
                  
                  ${shippingHtml} <hr>
                  <p>ID de la transacción: ${newOrder.mp_payment_id}</p>
                  <p>Revisá todos tus pedidos en el panel de Supabase.</p>
                </body>
              </html>
            `;

            const resendResponseVendedor = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: `Notificaciones Web <${SENDER_EMAIL}>`, // Sigue saliendo de noreply@...
                    to: [FRANCESCO_EMAIL], // ¡Se envía a Francesco!
                    subject: `¡Nueva Venta! - Pedido de ${userName}`,
                    html: emailHtmlVendedor
                })
            });

            if (resendResponseVendedor.ok) console.log('Email de NOTIFICACIÓN DE VENTA enviado a:', FRANCESCO_EMAIL);
            else console.warn('Pedido guardado, pero falló el envío de email al VENDEDOR:', await resendResponseVendedor.json());

        } catch (emailError) {
            console.error('Error catastrófico al enviar email al VENDEDOR:', emailError.message);
        }
        // --- Fin Email Vendedor ---
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