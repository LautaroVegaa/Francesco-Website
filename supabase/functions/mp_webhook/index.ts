// EN: supabase/functions/mp_webhook/index.ts
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Ya no necesitamos la librería de MP para el 'get', solo fetch.
// import { MercadoPagoConfig, Payment } from 'https://esm.sh/mercadopago@2.9.0';

// Inicia el cliente de Supabase (Admin)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
);

// Obtenemos el token de MP del entorno
const MP_ACCESS_TOKEN = Deno.env.get('ACCESS_TOKEN');

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();

    // 1. Solo nos interesa el evento de "pago"
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      
      // 2. ===== ¡AQUÍ ESTÁ EL CAMBIO! =====
      // Buscamos el pago completo en Mercado Pago usando fetch nativo
      // en lugar del SDK de MP que estaba fallando.
      const mpPaymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      });

      if (!mpPaymentResponse.ok) {
        throw new Error(`Error al obtener el pago desde MP: ${mpPaymentResponse.statusText}`);
      }

      const mpPayment = await mpPaymentResponse.json();
      // ===== FIN DEL CAMBIO =====


      // 3. Verificamos si fue aprobado
      if (mpPayment && mpPayment.status === 'approved') {
        
        // 4. Recuperamos el user_id de la metadata
        const userId = mpPayment.metadata?.user_id;
        
        if (!userId) {
          throw new Error('No se encontró user_id en la metadata del pago');
        }

        // 5. Preparamos los datos para nuestra tabla "pedidos"
        const newOrder = {
          user_id: userId,
          items: mpPayment.additional_information?.items || [],
          total_amount: Math.round(mpPayment.transaction_amount * 100), 
          payment_status: 'approved',
          mp_payment_id: paymentId,
        };

        // 6. Guardamos en la tabla "pedidos"
        const { error } = await supabaseAdmin
          .from('pedidos')
          .insert(newOrder);

        if (error) {
          console.error('Error al guardar en Supabase:', error);
          throw error;
        }
        
        console.log('Pedido registrado con éxito:', newOrder);
      }
    }

    // 7. Devolvemos 200 OK a Mercado Pago
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