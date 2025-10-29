// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

// Servidor HTTP de Deno (estándar)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// 👇 Cambiá esto por tu dominio real cuando publiques
const ALLOWED_ORIGIN = "*";

// === Función auxiliar para CORS ===
function cors(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

// === Servidor principal ===
serve(async (req: Request): Promise<Response> => {
  // Preflight (CORS)
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

    const { items } = await req.json();

    // Asegurar formato correcto de los items
    const mpItems = (items as any[]).map((i) => ({
      title: String(i.title),
      quantity: Number(i.quantity ?? 1),
      currency_id: "ARS",
      unit_price: Number(i.unit_price),
      picture_url: i.picture_url ?? undefined,
    }));

    // Configuración de la preferencia de pago
    const preference = {
      items: mpItems,
      back_urls: {
        success: "https://tusitio.com/success.html",
        failure: "https://tusitio.com/failure.html",
        pending: "https://tusitio.com/pending.html",
      },
      auto_return: "approved",
    };

    // Llamada a la API de Mercado Pago
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
          headers: cors({ "Content-Type": "application/json" }),
        },
      );
    }

    // ✅ Devolvemos el init_point al frontend
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
