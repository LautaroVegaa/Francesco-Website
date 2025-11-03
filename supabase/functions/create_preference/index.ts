// EN: supabase/functions/create_preference/index.ts
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// --- ¡NUEVA IMPORTACIÓN! ---
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://www.francescoretratos.com/";

function cors(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors() });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: cors({ "Content-Type": "application/json" }),
      });
    }

    // --- ¡NUEVO BLOQUE PARA OBTENER EL USUARIO! ---
    // 1. Creamos un cliente de Supabase usando los headers de la request
    //    Esto nos permite actuar en nombre del usuario que nos llama.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { 
        global: { 
          headers: { Authorization: req.headers.get("Authorization")! } 
        } 
      }
    );

    // 2. Obtenemos los datos del usuario a partir del token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error('Error de autenticación:', userError);
      return new Response(JSON.stringify({ error: "Token de autorización inválido" }), {
        status: 401,
        headers: cors({ "Content-Type": "application/json" }),
      });
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 401,
        headers: cors({ "Content-Type": "application/json" }),
      });
    }

    // --- ¡NUEVA COMPROBACIÓN AÑADIDA! ---
    // Verificamos si la propiedad 'email_confirmed_at' tiene un valor.
    if (!user.email_confirmed_at) {
      console.warn(`Intento de pago fallido: Email no verificado (ID: ${user.id})`);
      // Devolvemos un error 403 (Prohibido) al frontend
      return new Response(
        JSON.stringify({ error: "Por favor, verifica tu email antes de poder comprar." }),
        {
          status: 403, // 403 Forbidden
          headers: cors({ "Content-Type": "application/json" }),
        }
      );
    }
    // --- FIN DE LA NUEVA COMPROBACIÓN ---
    
    // 3. ¡Aquí tenemos el ID del usuario!
    const userId = user.id;
    // --- FIN DEL BLOQUE NUEVO ---

    const { items } = await req.json();

    const mpItems = (items as any[]).map((i) => ({
      title: String(i.title),
      quantity: Number(i.quantity ?? 1),
      currency_id: "ARS",
      unit_price: Number(i.unit_price),
      picture_url: i.picture_url ?? undefined,
    }));

    const preference = {
      items: mpItems,
      back_urls: {
        success: "https://francescoretratos.com/success.html",
        failure: "https://francescoretratos.com/failure.html",
        pending: "https://francescoretratos.com/pending.html",
      },
      auto_return: "approved",
      
      // --- ¡ESTA ES LA LÍNEA CLAVE QUE AÑADIMOS! ---
      // Aquí le pasamos el user_id a Mercado Pago
      metadata: {
        user_id: userId,
        items: mpItems
      }
    };

    // Llamada a la API de Mercado Pago
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("ACCESS_TOKEN")}`, // Token de MP
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Mercado Pago error:", data);
      return new Response(
        JSON.stringify({ error: "MP create preference failed", details: data }),
        {
          status: 500,
          headers: cors({ "Content-Type": "application/json" }),
        },
      );
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: cors({ "Content-Type": "application/json" }),
    });
  } catch (e: any) {
    console.error("Error general:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: cors({ "Content-Type": "application/json" }),
      },
    );
  }
});