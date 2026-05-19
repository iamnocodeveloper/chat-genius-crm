import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, apikey, x-client-info",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { destination, assistantId, phoneNumberId, campaignId } =
      await req.json();

    if (!destination || !assistantId || !phoneNumberId) {
      return new Response(
        JSON.stringify({
          error: "destination, assistantId and phoneNumberId are required",
        }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // Limpiar y formatear a formato estricto E.164 (+ y solo dígitos)
    let cleanDestination = destination.trim();
    const hasPlus = cleanDestination.startsWith("+");
    const digitsOnly = cleanDestination.replace(/\D/g, "");
    cleanDestination = hasPlus ? `+${digitsOnly}` : `+${digitsOnly}`;

    // Build VAPI outbound call payload
    const vapiPayload: Record<string, any> = {
      assistantId,
      phoneNumberId,
      customer: {
        number: cleanDestination,
      },
    };

    console.log('VAPI call payload:', JSON.stringify(vapiPayload));

    const vapiResp = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("VAPI_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vapiPayload),
    });

    if (!vapiResp.ok) {
      const txt = await vapiResp.text();
      console.error("VAPI call error:", txt);
      return new Response(
        JSON.stringify({ error: "VAPI call error", details: txt }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const vapiCallData = await vapiResp.json();
    const vapiCallId = vapiCallData.id;
    const status = vapiCallData.status ?? "queued";

    // Guardar en Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: callRecord, error: dbErr } = await supabase
      .from("vapi_calls")
      .insert({
        vapi_call_id: vapiCallId,
        campaign_id: campaignId ?? null,
        assistant_id: assistantId,
        phone_number_id: phoneNumberId,
        destination,
        status,
        raw_event: vapiCallData,
      })
      .select()
      .single();

    if (dbErr) {
      console.error("DB insert error:", dbErr);
      return new Response(
        JSON.stringify({ error: "DB insert failed", details: dbErr }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, vapiCallId, status, call: callRecord }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
