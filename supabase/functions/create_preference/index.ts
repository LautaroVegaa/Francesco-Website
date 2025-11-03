// EN: supabase/functions/create_preference/index.ts
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CAMBIO 1: Hacemos una lista de dominios permitidos ---
const ALLOWED_ORIGINS = [
  "https://www.francescoretratos.com", // Tu dominio de producción
  "http://localhost:5500",           // Para pruebas locales (ej. Live Server)
  "http://127.0.0.1:5500",         // Para pruebas locales
  "http://localhost:3000"            // Por si usas un framework
];

// --- CAMBIO 2: La función CORS ahora es dinámica ---
function cors(req: Request, headers: HeadersInit = {}): HeadersInit {
  const origin = req.headers.get("Origin");

  // Comprueba si el origen de la petición está en tu lista
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin!)
    ? origin!
    // Usamos tu dominio de producción como fallback
    : "https://www.francescoretratos.com"; 

  return {
    ...headers,
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req: Request): Promise<Response> => {
  // --- CAMBIO 3: Pasa 'req' a la función cors ---
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(req) });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        // --- CAMBIO 4: Pasa 'req' en TODAS las respuestas ---
        headers: cors(req, { "Content-Type": "application/json" }),
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { 
        global: { 
          headers: { Authorization: req.headers.get("Authorization")! } 
        } 
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error('Error de autenticación:', userError);
      return new Response(JSON.stringify({ error: "Token de autorización inválido" }), {
        status: 401,
        headers: cors(req, { "Content-Type": "application/json" }),
      });
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 401,
        headers: cors(req, { "Content-Type": "application/json" }),
      });
    }

    if (!user.email_confirmed_at) {
      console.warn(`Intento de pago fallido: Email no verificado (ID: ${user.id})`);
      return new Response(
        JSON.stringify({ error: "Por favor, verifica tu email antes de poder comprar." }),
        {
          status: 403,
          headers: cors(req, { "Content-Type": "application/json" }),
        }
      );
    }
    
    const userId = user.id;
// --- INICIO DE LÍNEA MODIFICADA ---
    const { items, shipping_details } = await req.json();
// --- FIN DE LÍNEA MODIFICADA ---

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
        // Tu dominio ya estaba correcto aquí
        success: "https://www.francescoretratos.com/success.html",
        failure: "https://www.francescoretratos.com/failure.html",
        pending: "https://www.francescoretratos.com/pending.html",
      },
      auto_return: "approved",
// --- INICIO DE BLOQUE MODIFICADO ---
      metadata: {
        user_id: userId,
        items: mpItems,
        shipping_address: shipping_details // <-- Línea añadida
      }
// --- FIN DE BLOQUE MODIFICADO ---
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("ACCESS_TOKEN")}`,
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
          headers: cors(req, { "Content-Type": "application/json" }),
        },
      );
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: cors(req, { "Content-Type": "application/json" }),
    });
  } catch (e: any) {
    console.error("Error general:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: cors(req, { "Content-Type": "application/json" }),
      },
    );
  }
});