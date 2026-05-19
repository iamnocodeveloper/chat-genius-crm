import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, apikey, x-client-info",
};

function normalizeTranscript(transcript: unknown): string | null {
  if (!transcript) return null;
  if (typeof transcript === "string") return transcript;
  if (Array.isArray(transcript)) {
    const lines = transcript
      .map((s) => {
        if (!s) return "";
        if (typeof s === "string") return s;
        if (typeof s === "object") {
          const rec = s as Record<string, unknown>;
          const speaker = typeof rec.speaker === "string" ? rec.speaker : "";
          const text = typeof rec.text === "string" ? rec.text : "";
          if (speaker && text) return `${speaker}: ${text}`;
          return text || "";
        }
        return String(s);
      })
      .filter(Boolean);
    return lines.length ? lines.join("\n") : null;
  }
  if (typeof transcript === "object") {
    const rec = transcript as Record<string, unknown>;
    if (typeof rec.text === "string") return rec.text;
    if (Array.isArray(rec.segments)) return normalizeTranscript(rec.segments);
  }
  return null;
}

function extractCallFields(callDetails: any) {
  const status = callDetails?.status ?? null;
  const startedAt = callDetails?.startedAt ?? callDetails?.started_at ?? null;
  const endedAt = callDetails?.endedAt ?? callDetails?.ended_at ?? null;
  const durationSeconds =
    callDetails?.durationSeconds ?? callDetails?.duration_seconds ??
      callDetails?.duration ?? null;

  const summary = callDetails?.summary ?? callDetails?.analysis?.summary ?? null;
  const transcript =
    normalizeTranscript(callDetails?.transcript) ??
      normalizeTranscript(callDetails?.artifact?.transcript) ??
      normalizeTranscript(callDetails?.artifacts?.transcript) ??
      null;

  const recordingUrl =
    callDetails?.recordingUrl ?? callDetails?.recording_url ??
      callDetails?.artifact?.recordingUrl ??
      callDetails?.artifacts?.recordingUrl ??
      callDetails?.artifact?.recording_url ??
      callDetails?.artifacts?.recording_url ??
      null;

  const endedReason =
    callDetails?.endedReason ?? callDetails?.ended_reason ?? null;

  const analysis = callDetails?.analysis ?? null;

  return {
    status,
    startedAt,
    endedAt,
    durationSeconds,
    summary,
    transcript,
    recordingUrl,
    endedReason,
    analysis,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const payload = await req.json();
    console.log("VAPI webhook received:", JSON.stringify(payload));

    // VAPI envía el evento dentro de "message"
    const message = payload.message ?? payload;
    const type = message.type ?? payload.type;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Obtener el callId del evento
    const callId =
      message.call?.id ??
      payload.call?.id ??
      message.callId ??
      payload.callId;

    const shouldForceSync =
      payload?.mode === "sync" && (typeof payload?.callId === "string");
    const syncCallId = shouldForceSync ? payload.callId : null;

    const effectiveCallId = shouldForceSync ? syncCallId : callId;

    if (!effectiveCallId) {
      console.log("No callId found in payload, skipping.");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, any> = {
      raw_event: payload,
      updated_at: new Date().toISOString(),
    };

    // Mapear eventos de VAPI a campos de la tabla
    if (
      shouldForceSync ||
      type === "end-of-call-report" ||
      type === "call.completed"
    ) {
      const vapiKey = Deno.env.get("VAPI_KEY") ?? "";
      if (vapiKey) {
        try {
          const resp = await fetch(`https://api.vapi.ai/call/${effectiveCallId}`, {
            headers: {
              Authorization: `Bearer ${vapiKey}`,
            },
          });
          const bodyText = await resp.text();
          if (!resp.ok) {
            console.error("VAPI get call error:", resp.status, bodyText);
            updates.status = "completed";
            updates.ended_at = new Date().toISOString();
          } else {
            const callDetails = JSON.parse(bodyText);
            const fields = extractCallFields(callDetails);
            updates.raw_event = callDetails;
            if (fields.status) updates.status = fields.status;
            if (fields.startedAt) updates.started_at = new Date(fields.startedAt).toISOString();
            if (fields.endedAt) updates.ended_at = new Date(fields.endedAt).toISOString();
            if (fields.durationSeconds != null) updates.duration_seconds = fields.durationSeconds;
            if (fields.transcript) updates.transcript = fields.transcript;
            if (fields.summary) updates.summary = fields.summary;
            if (fields.recordingUrl) updates.recording_url = fields.recordingUrl;
            if (fields.endedReason) updates.ended_reason = fields.endedReason;
            if (fields.analysis) updates.intent = fields.analysis;
          }
        } catch (e) {
          console.error("VAPI get call exception:", e);
          updates.status = "completed";
          updates.ended_at = new Date().toISOString();
        }
      } else {
        updates.status = "completed";
        updates.ended_at = message.endedAt
          ? new Date(message.endedAt).toISOString()
          : new Date().toISOString();
        updates.duration_seconds = message.durationSeconds ?? message.duration ?? null;
        updates.transcript = message.transcript ?? null;
        updates.summary = message.summary ?? null;
        updates.recording_url = message.recordingUrl ?? null;
        updates.ended_reason = message.endedReason ?? null;
        if (message.analysis) {
          updates.intent = message.analysis;
        }
      }
    } else if (type === "status-update" || type === "call.status-update") {
      updates.status = message.status ?? "unknown";
    } else if (type === "transcript") {
      updates.transcript = message.transcript ?? null;
    } else if (type === "call.failed" || type === "call-ended") {
      updates.status = "failed";
      updates.ended_at = new Date().toISOString();
      updates.ended_reason = message.endedReason ?? "unknown";
    }

    const { error: updateErr } = await supabase
      .from("vapi_calls")
      .update(updates)
      .eq("vapi_call_id", effectiveCallId);

    if (updateErr) {
      console.error("Error updating vapi_call:", updateErr);
    } else {
      console.log(`Call ${effectiveCallId} updated with type: ${type ?? "sync"}`);
    }

    return new Response(JSON.stringify({ received: true, synced: shouldForceSync }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Siempre responder 200 para que VAPI no reintente
    return new Response(JSON.stringify({ received: true, error: error.message }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
