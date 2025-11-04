// EN: supabase/functions/create_preference/index.ts
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Lista de dominios permitidos ---
const ALLOWED_ORIGINS = [
  "https://www.francescoretratos.com",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000"
];

// --- Función CORS dinámica ---
function cors(req: Request, headers: HeadersInit = {}): HeadersInit {
  const origin = req.headers.get("Origin");
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin!)
    ? origin!
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
  // Manejo de pre-vuelo (preflight) OPTIONS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(req) });
  }

  try {
    // 1. VERIFICACIÓN DE AUTENTICACIÓN (Sin cambios)
    // (Asegura que el usuario esté logueado)
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

    if (userError || !user) {
      console.error('Error de autenticación:', userError);
      return new Response(JSON.stringify({ error: "Token de autorización inválido" }), {
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

    // ==========================================================
    // ===== INICIO DEL NUEVO BLOQUE DE LÓGICA DE SEGURIDAD =====
    // ==========================================================

    // 2. OBTENER DATOS DEL CLIENTE
    // clientItems será algo como: [{id: 1, quantity: 2}, {id: 7, quantity: 1}]
    const { items: clientItems, shipping_details } = await req.json();

    if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
      return new Response(JSON.stringify({ error: "Carrito vacío o formato incorrecto" }), {
        status: 400,
        headers: cors(req, { "Content-Type": "application/json" }),
      });
    }

    // 3. EXTRAER IDs Y CREAR CLIENTE ADMIN
    // Necesitamos un cliente "Admin" para leer la tabla 'productos' de forma segura.
    const productIds = clientItems.map((item: any) => item.id);
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // ¡Usamos la SERVICE KEY segura!
    );
    
    // 4. CONSULTAR LA BASE DE DATOS (LA "FUENTE DE LA VERDAD")
    // Buscamos los productos que el cliente quiere comprar.
    const { data: products, error: dbError } = await supabaseAdmin
      .from('productos')
      .select('id, title_es, price, image_url') // Solo traemos lo que necesitamos
      .in('id', productIds); // `in` es como hacer "WHERE id=1 OR id=7"

    if (dbError) {
      console.error("Error al consultar la base de datos:", dbError);
      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: cors(req, { "Content-Type": "application/json" }),
      });
    }

    // 5. CONSTRUIR EL CARRITO SEGURO (mpItems)
    // Recorremos el carrito del cliente y lo validamos contra nuestros
    // resultados de la base de datos.
    
    const mpItems = [];
    const sitioWebUrl = "https://www.francescoretratos.com"; // URL base para imágenes

    for (const clientItem of clientItems) {
      // Buscamos el producto real en los resultados de la DB
      const product = products.find((p: any) => p.id === clientItem.id);

      if (!product) {
        // El cliente intentó comprar un ID que no existe (ej. 999)
        console.warn(`Intento de compra de producto inexistente: ID ${clientItem.id}`);
        continue; // Ignoramos este ítem y seguimos
      }

      // ¡AQUÍ ESTÁ LA MAGIA!
      // Usamos el precio y título de la DB (product.price),
      // no del cliente (clientItem.price, que ya no existe).
      mpItems.push({
        id: product.id,
        title: String(product.title_es), // Título seguro
        quantity: Number(clientItem.quantity), // La cantidad está bien
        currency_id: "ARS",
        unit_price: Number(product.price), // <-- ¡PRECIO SEGURO!
        picture_url: `${sitioWebUrl}/images/${product.image_url}`, // URL completa para MP
      });
    }

    if (mpItems.length === 0) {
      return new Response(JSON.stringify({ error: "No se encontraron productos válidos en el carrito" }), {
        status: 400,
        headers: cors(req, { "Content-Type": "application/json" }),
      });
    }

    // ========================================================
    // ===== FIN DEL NUEVO BLOQUE DE LÓGICA DE SEGURIDAD =====
    // ========================================================

    // 6. CREAR PREFERENCIA DE MERCADO PAGO
    // (Esta parte es casi igual que antes, pero ahora usa
    // nuestro 'mpItems' seguro y guarda 'mpItems' en metadata
    // para el webhook)
    
    const preference = {
      items: mpItems,
      back_urls: {
        success: `${sitioWebUrl}/success.html`,
        failure: `${sitioWebUrl}/failure.html`,
        pending: `${sitioWebUrl}/pending.html`,
      },
      auto_return: "approved",
      metadata: {
        user_id: userId,
        items: mpItems, // Guardamos los items seguros para el webhook
        shipping_address: shipping_details
      }
    };

    // 7. LLAMAR A MERCADO PAGO
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
      console.error("Error de Mercado Pago:", data);
      return new Response(
        JSON.stringify({ error: "Fallo al crear preferencia de MP", details: data }),
        {
          status: 500,
          headers: cors(req, { "Content-Type": "application/json" }),
        },
      );
    }

    // 8. DEVOLVER EL init_point AL CLIENTE
    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: cors(req, { "Content-Type": "application/json" }),
    });

  } catch (e: any) {
    // Manejo de errores generales
    console.error("Error general en la función:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Error desconocido" }),
      {
        status: 500,
        headers: cors(req, { "Content-Type": "application/json" }),
      },
    );
  }
});