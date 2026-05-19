import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { campaignId } = await req.json();
    if (!campaignId) throw new Error("campaignId is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Obtener datos de la campaña
    const { data: campaign, error: fetchErr } = await supabase
      .from("vapi_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (fetchErr || !campaign) throw new Error("Campaign not found");

    // 2. Actualizar estado a running
    await supabase.from("vapi_campaigns").update({ status: "running" }).eq("id", campaignId);

    const contacts = campaign.contacts;
    console.log(`Starting campaign ${campaign.name} for ${contacts.length} contacts`);

    // 3. Ejecutar llamadas
    let firstError = null;
    for (const phone of contacts) {
      try {
        // Limpiar y formatear a formato estricto E.164 (+ y solo dígitos)
        let cleanPhone = phone.trim();
        const hasPlus = cleanPhone.startsWith("+");
        const digitsOnly = cleanPhone.replace(/\D/g, "");
        cleanPhone = hasPlus ? `+${digitsOnly}` : `+${digitsOnly}`;

        const vapiPayload = {
          assistantId: campaign.assistant_id,
          phoneNumberId: campaign.phone_number_id,
          customer: {
            number: cleanPhone,
          },
        };

        const vapiResp = await fetch("https://api.vapi.ai/call", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("VAPI_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vapiPayload),
        });

        if (!vapiResp.ok) {
          firstError = await vapiResp.text();
          console.error(`VAPI Error for ${phone}:`, firstError);
          break; // Detener para informar el error
        }
      } catch (e) {
        firstError = e.message;
        break;
      }
    }

    if (firstError) {
      await supabase.from("vapi_campaigns").update({ status: "error" }).eq("id", campaignId);
      return new Response(JSON.stringify({ success: false, error: firstError }), {
        status: 200, // Retornamos 200 para que el CRM lea el JSON de error
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 4. Finalizar
    await supabase.from("vapi_campaigns").update({ status: "completed" }).eq("id", campaignId);

    return new Response(JSON.stringify({ success: true, message: "Campaign finished" }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
  }
});
