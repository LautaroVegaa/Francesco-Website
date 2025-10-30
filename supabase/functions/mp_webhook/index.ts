// EN: supabase/functions/mp_webhook/index.ts
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MercadoPagoConfig, Payment } from 'https://esm.sh/mercadopago@2.9.0';

// Inicia el cliente de Mercado Pago (usará el Access Token del .env)
const mpClient = new MercadoPagoConfig({ 
  accessToken: Deno.env.get('ACCESS_TOKEN')! 
});
const payment = new Payment(mpClient);

// Inicia el cliente de Supabase (Admin)
// ¡OJO! Esta vez usamos la SERVICE_ROLE_KEY para poder escribir en la DB
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
);

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();

    // 1. Solo nos interesa el evento de "pago"
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      
      // 2. Buscamos el pago completo en Mercado Pago
      const mpPayment = await payment.get({ id: paymentId });

      // 3. Verificamos si fue aprobado
      if (mpPayment && mpPayment.status === 'approved') {
        
        // 4. ¡Recuperamos el user_id que guardamos en la metadata!
        const userId = mpPayment.metadata?.user_id;
        
        if (!userId) {
          throw new Error('No se encontró user_id en la metadata del pago');
        }

        // 5. Preparamos los datos para nuestra tabla "pedidos"
        const newOrder = {
          user_id: userId,
          items: mpPayment.additional_information?.items || [],
          // Guardamos el total en centavos (ej: 100.50 ARS -> 10050)
          total_amount: Math.round(mpPayment.transaction_amount * 100), 
          payment_status: 'approved',
          mp_payment_id: paymentId,
        };

        // 6. Guardamos en la tabla "pedidos" usando el cliente Admin
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

    // 7. Devolvemos 200 OK a Mercado Pago para que sepa que recibimos
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error en el webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400, // Devolvemos un error
    });
  }
});