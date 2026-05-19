import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Phone, Upload, X, FileText, Paperclip, Loader2,
  Bot, Mic, BarChart3, Play, RefreshCw, CheckCircle2,
  XCircle, Clock, PhoneCall, Users, Headphones, TrendingUp, AlertTriangle
} from 'lucide-react';
import Papa from 'papaparse';

interface VapiAssistant {
  id: string;
  vapi_assistant_id: string;
  name: string;
  model_name: string;
  voice_id: string;
  created_at: string;
}

interface VapiCampaign {
  id: string;
  name: string;
  assistant_id: string;
  phone_number_id: string;
  contacts: string[];
  status: 'pending' | 'running' | 'completed';
  created_at: string;
}

interface VapiPhoneNumber {
  id: string;
  vapi_phone_number_id: string;
  friendly_name: string;
  phone_number: string;
}

interface VapiCall {
  id: string;
  vapi_call_id: string;
  destination: string;
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds: number | null;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  ended_reason: string | null;
  intent?: any | null;
  raw_event?: any | null;
  created_at: string;
}

interface AttachmentFile { file: File; name: string; }

type ActiveTab = 'create' | 'campaigns' | 'calls' | 'history';
type AgentTab = 'vinculacion' | 'soporte' | 'ventas' | 'linea';

const SPECIALIZED_AGENTS: { id: AgentTab; label: string; vapiId: string; color: string; bg: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'vinculacion',
    label: 'Campaña de Vinculación',
    vapiId: '9daec561-013f-49e1-b114-3946211853bf',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: <Users className="h-4 w-4" />,
    description: 'Llama a prospectos para establecer un primer contacto y vincularlos como clientes.'
  },
  {
    id: 'soporte',
    label: 'Conversación de Soporte',
    vapiId: '',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    icon: <Headphones className="h-4 w-4" />,
    description: 'Gestiona llamadas de soporte técnico y atención al cliente.'
  },
  {
    id: 'ventas',
    label: 'Ventas / Planes',
    vapiId: '',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Presenta planes y ofertas comerciales a clientes potenciales.'
  },
  {
    id: 'linea',
    label: 'Vinculación de Líneas',
    vapiId: '660b64e7-51ff-4dee-8557-f819c2821938',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Gestiona y atiende procesos relacionados con la vinculación de líneas.'
  },
];

const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'create', label: 'Nueva Campaña', icon: <Bot className="h-4 w-4" /> },
  { id: 'campaigns', label: 'Gestión de Campañas', icon: <Play className="h-4 w-4" /> },
  { id: 'calls', label: 'Agentes Especializados', icon: <PhoneCall className="h-4 w-4" /> },
  { id: 'history', label: 'Historial', icon: <BarChart3 className="h-4 w-4" /> },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function callFn(fn: string, body: object) {
  return fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    queued:     { label: 'En cola',     color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    ringing:    { label: 'Llamando',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'in-progress': { label: 'En curso', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    completed:  { label: 'Completada', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    failed:     { label: 'Fallida',    color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    ended:      { label: 'Finalizada', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };
  const s = map[status] ?? { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function LlamadasIA() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');

  // ---- Estado: crear asistente + campaña ----
  const [campaignName, setCampaignName] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [voiceId, setVoiceId] = useState('bIHbv24MWmeRgasZH58o'); // Rachel (11labs)
  const [voiceProvider, setVoiceProvider] = useState('11labs');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  const [contactsText, setContactsText] = useState('');
  const [kbFiles, setKbFiles] = useState<AttachmentFile[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // ---- Listas ----
  const [assistants, setAssistants] = useState<VapiAssistant[]>([]);
  const [campaigns, setCampaigns] = useState<VapiCampaign[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<VapiPhoneNumber[]>([]);
  const [calls, setCalls] = useState<VapiCall[]>([]);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // ---- Llamada rápida ----
  const [quickDest, setQuickDest] = useState('');
  const [quickAssistant, setQuickAssistant] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [loadingQuickCall, setLoadingQuickCall] = useState(false);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [syncingCallId, setSyncingCallId] = useState<string | null>(null);

  // ---- Agentes especializados ----
  const [agentTab, setAgentTab] = useState<AgentTab>('vinculacion');
  const [agentNumbers, setAgentNumbers] = useState<Record<AgentTab, string>>({
    vinculacion: '', soporte: '', ventas: '', linea: ''
  });
  const [agentPhone, setAgentPhone] = useState<Record<AgentTab, string>>({
    vinculacion: '', soporte: '', ventas: '', linea: ''
  });
  const [agentLoading, setAgentLoading] = useState<Record<AgentTab, boolean>>({
    vinculacion: false, soporte: false, ventas: false, linea: false
  });

  const parseContacts = (t: string) =>
    t.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  // ---- Cargar datos al montar ----
  useEffect(() => {
    loadPhoneNumbers();
    loadAssistants();
    loadCalls();
    loadVoices();
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoadingCampaigns(true);
    const { data } = await supabase.from('vapi_campaigns').select('*').order('created_at', { ascending: false });
    if (data) setCampaigns(data as VapiCampaign[]);
    setLoadingCampaigns(false);
  }

  async function loadVoices() {
    const { data } = await supabase.from('vapi_voices').select('*').order('name');
    if (data) setAvailableVoices(data);
  }

  async function syncVoices() {
    setLoadingVoices(true);
    try {
      const res = await callFn('vapi-sync-voices', {});
      if (res.success) {
        toast({ title: "Voces sincronizadas", description: `Se han cargado ${res.count} voces.` });
        loadVoices();
      } else {
        toast({ title: "Error", description: res.details || "No se pudieron sincronizar las voces.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setLoadingVoices(false);
    }
  }

  const loadPhoneNumbers = async () => {
    setLoadingNumbers(true);
    const { data } = await supabase.from('vapi_phone_numbers').select('*').order('friendly_name');
    if (data) setPhoneNumbers(data);
    setLoadingNumbers(false);
  };

  const loadAssistants = async () => {
    const { data } = await supabase.from('vapi_assistants').select('*').order('created_at', { ascending: false });
    if (data) setAssistants(data as VapiAssistant[]);
  };

  const loadCalls = async () => {
    setLoadingCalls(true);
    const { data } = await supabase.from('vapi_calls').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setCalls(data as VapiCall[]);
    setLoadingCalls(false);
  };

  const syncCallDetails = async (callId: string) => {
    setSyncingCallId(callId);
    try {
      const res = await callFn('vapi-callback', { mode: 'sync', callId });
      if (res?.received) {
        toast({ title: 'Sincronizado', description: 'Se actualizaron los detalles desde VAPI.' });
        await loadCalls();
      } else {
        toast({ title: 'Error', description: res?.error || 'No se pudo sincronizar con VAPI.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'No se pudo sincronizar con VAPI.', variant: 'destructive' });
    } finally {
      setSyncingCallId(null);
    }
  };

  const syncPhoneNumbers = async () => {
    setLoadingNumbers(true);
    const res = await callFn('vapi-sync-phone-numbers', {});
    if (res.success) {
      toast({ title: `${res.count} números sincronizados` });
      loadPhoneNumbers();
    } else {
      toast({ title: 'Error al sincronizar', description: res.error || res.details, variant: 'destructive' });
    }
    setLoadingNumbers(false);
  };

  const handleContactsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (r) => {
          const nums = (r.data as any[]).map(row => row[0]).filter(Boolean);
          setContactsText(p => p ? `${p}\n${nums.join('\n')}` : nums.join('\n'));
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = ev => setContactsText(p => p ? `${p}\n${ev.target?.result}` : ev.target?.result as string);
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return toast({ title: 'El nombre es requerido', variant: 'destructive' });
    if (!systemPrompt.trim()) return toast({ title: 'El prompt del asistente es requerido', variant: 'destructive' });
    if (!selectedPhoneId) return toast({ title: 'Selecciona un número de teléfono', variant: 'destructive' });
    const contacts = parseContacts(contactsText);
    if (!contacts.length) return toast({ title: 'Agrega al menos un contacto', variant: 'destructive' });

    setLoadingCreate(true);
    try {
      // 1. Crear asistente en VAPI
      const assistantRes = await callFn('vapi-create-assistant', {
        name: campaignName,
        firstMessage: firstMessage || 'Hola, ¿cómo puedo ayudarte?',
        systemPrompt,
        voiceProvider,
        voiceId,
        modelName,
      });
      if (!assistantRes.success) throw new Error(assistantRes.error || 'Error al crear asistente');

      // 2. Guardar campaña en vapi_campaigns
      const { error: campaignErr } = await supabase
        .from('vapi_campaigns')
        .insert({
          name: campaignName,
          assistant_id: assistantRes.vapiAssistantId,
          phone_number_id: selectedPhoneId,
          contacts,
          status: 'pending',
        });

      if (campaignErr) throw campaignErr;

      toast({
        title: '¡Campaña guardada!',
        description: `El asistente se creó correctamente. Ahora puedes ejecutar la campaña desde la pestaña Gestión.`,
      });

      // Limpiar formulario
      setCampaignName(''); setFirstMessage(''); setSystemPrompt('');
      setContactsText(''); setKbFiles([]); setSelectedPhoneId('');
      loadCampaigns();
      setActiveTab('campaigns');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingCreate(false);
    }
  };

  const executeCampaign = async (campaign: VapiCampaign) => {
    toast({ title: "Iniciando campaña", description: "Procesando llamadas en segundo plano..." });
    
    // Optimismo: actualizar UI
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'running' } : c));

    try {
      const res = await callFn('vapi-run-campaign', { campaignId: campaign.id });
      if (res.success) {
        toast({ title: "Campaña completada", description: `Se han procesado los contactos de ${campaign.name}` });
      } else {
        toast({ title: "Error en campaña", description: res.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      loadCampaigns();
      loadCalls();
    }
  };

  const handleAgentCall = async (agId: AgentTab) => {
    const agent = SPECIALIZED_AGENTS.find(a => a.id === agId)!;
    const numbersRaw = agentNumbers[agId];
    const phoneId = agentPhone[agId];
    if (!numbersRaw.trim()) return toast({ title: 'Ingresa al menos un número', variant: 'destructive' });
    if (!phoneId) return toast({ title: 'Selecciona un número de origen', variant: 'destructive' });
    if (!agent.vapiId) return toast({ title: 'Agente no configurado', description: 'El ID del agente VAPI aún no está configurado para esta sección.', variant: 'destructive' });
    const destinations = numbersRaw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    setAgentLoading(prev => ({ ...prev, [agId]: true }));
    let errors = 0;
    for (const dest of destinations) {
      const res = await callFn('vapi-call', { destination: dest, assistantId: agent.vapiId, phoneNumberId: phoneId });
      if (!res.success) errors++;
    }
    setAgentLoading(prev => ({ ...prev, [agId]: false }));
    if (errors === 0) {
      toast({ title: `✅ ${destinations.length} llamada(s) iniciadas`, description: `Agente: ${agent.label}` });
      setAgentNumbers(prev => ({ ...prev, [agId]: '' }));
    } else {
      toast({ title: `⚠️ ${errors} llamada(s) fallaron`, description: 'Revisa el historial para más detalles.', variant: 'destructive' });
    }
    loadCalls();
  };

  const handleQuickCall = async () => {
    if (!quickDest || !quickAssistant || !quickPhone) {
      return toast({ title: 'Completa todos los campos', variant: 'destructive' });
    }
    setLoadingQuickCall(true);
    const res = await callFn('vapi-call', {
      destination: quickDest,
      assistantId: quickAssistant,
      phoneNumberId: quickPhone,
    });
    if (res.success) {
      toast({ title: 'Llamada iniciada', description: `ID: ${res.vapiCallId}` });
      setQuickDest('');
      loadCalls();
    } else {
      toast({ title: 'Error al llamar', description: res.error || res.details, variant: 'destructive' });
    }
    setLoadingQuickCall(false);
  };

  // ---- Stats ----
  const stats = {
    total: calls.length,
    completed: calls.filter(c => c.status === 'completed').length,
    failed: calls.filter(c => c.status === 'failed').length,
    avgDuration: calls.filter(c => c.duration_seconds).reduce((acc, c) => acc + (c.duration_seconds ?? 0), 0)
      / (calls.filter(c => c.duration_seconds).length || 1),
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Phone className="h-8 w-8 text-primary" />
              Llamadas IA
            </h1>
            <p className="text-muted-foreground mt-1">Integración con VAPI – Llamadas automatizadas con IA</p>
          </div>
          <Button variant="outline" size="sm" onClick={syncPhoneNumbers} disabled={loadingNumbers}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingNumbers ? 'animate-spin' : ''}`} />
            Sincronizar números
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total llamadas', value: stats.total, icon: <Phone className="h-5 w-5 text-primary" /> },
            { label: 'Completadas', value: stats.completed, icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
            { label: 'Fallidas', value: stats.failed, icon: <XCircle className="h-5 w-5 text-red-400" /> },
            { label: 'Dur. promedio', value: `${Math.round(stats.avgDuration)}s`, icon: <Clock className="h-5 w-5 text-blue-400" /> },
          ].map(s => (
            <Card key={s.label} className="border-border">
              <CardContent className="pt-4 flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ========== TAB: NUEVA CAMPAÑA ========== */}
        {activeTab === 'create' && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Crear Campaña + Asistente IA</CardTitle>
              <CardDescription>Configura el asistente, los contactos y el número de origen. El asistente se creará automáticamente en VAPI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la campaña *</Label>
                  <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ej. Prospección Mayo 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Primer mensaje del asistente</Label>
                  <Input value={firstMessage} onChange={e => setFirstMessage(e.target.value)} placeholder="Hola, ¿cómo puedo ayudarte?" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prompt del sistema (instrucciones para la IA) *</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  placeholder="Eres un asistente de ventas para la empresa X. Tu objetivo es agendar una cita. Presenta los siguientes beneficios: ..."
                  className="min-h-[130px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Voz del asistente</Label>
                    <button 
                      onClick={syncVoices} 
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      disabled={loadingVoices}
                    >
                      {loadingVoices ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Sincronizar voces
                    </button>
                  </div>
                  <select
                    value={`${voiceProvider}:${voiceId}`}
                    onChange={e => {
                      const [p, id] = e.target.value.split(':');
                      setVoiceProvider(p);
                      setVoiceId(id);
                    }}
                    className="w-full p-2 rounded-md bg-background border border-border text-foreground text-sm"
                  >
                    <option value="11labs:bIHbv24MWmeRgasZH58o">Voz por defecto (Rachel - 11labs)</option>
                    {availableVoices.length > 0 && (
                      <optgroup label="Voces disponibles en VAPI">
                        {availableVoices.map(v => (
                          <option key={v.vapi_voice_id} value={`${v.provider}:${v.vapi_voice_id}`}>
                            {v.name} ({v.provider})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Opciones rápidas">
                      <option value="11labs:pNInz6obpgDQGcFMA">Adam (11labs)</option>
                      <option value="playht:jennifer">Jennifer (PlayHT)</option>
                      <option value="google:es-MX-Standard-A">Español MX (Google)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Modelo de IA</Label>
                  <select
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    className="w-full p-2 rounded-md bg-background border border-border text-foreground text-sm"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (rápido)</option>
                    <option value="gpt-4o">GPT-4o (mejor calidad)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (económico)</option>
                  </select>
                </div>
              </div>

              {/* Número de origen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Número de origen (VAPI) *</Label>
                  {loadingNumbers && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {phoneNumbers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay números configurados.{' '}
                    <button onClick={syncPhoneNumbers} className="text-primary underline">Sincronizar ahora</button>
                  </p>
                ) : (
                  <select
                    value={selectedPhoneId}
                    onChange={e => setSelectedPhoneId(e.target.value)}
                    className="w-full p-2 rounded-md bg-background border border-border text-foreground text-sm"
                  >
                    <option value="">— Selecciona un número —</option>
                    {phoneNumbers.map(n => (
                      <option key={n.vapi_phone_number_id} value={n.vapi_phone_number_id}>
                        {n.friendly_name} {n.phone_number ? `(${n.phone_number})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Contactos */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <Label>Contactos (números de teléfono) *</Label>
                  <div>
                    <input id="contacts-file" type="file" accept=".csv,.txt" onChange={handleContactsFile} className="hidden" />
                    <label htmlFor="contacts-file">
                      <Button variant="outline" size="sm" asChild className="cursor-pointer">
                        <span><Upload className="h-4 w-4 mr-2" />Subir CSV/TXT</span>
                      </Button>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Pega los números en formato E.164 (+15551234567) separados por comas o saltos de línea.</p>
                <Textarea
                  value={contactsText}
                  onChange={e => setContactsText(e.target.value)}
                  placeholder="+15551234567&#10;+525551234567"
                  className="min-h-[100px] font-mono text-sm"
                />
                {parseContacts(contactsText).length > 0 && (
                  <p className="text-sm text-primary font-medium">{parseContacts(contactsText).length} contactos detectados</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleCreateCampaign} disabled={loadingCreate} className="min-w-[220px]">
                  {loadingCreate ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando asistente y llamadas...</>
                  ) : (
                    <><Bot className="mr-2 h-4 w-4" />Crear asistente e iniciar campaña</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== TAB: GESTIÓN DE CAMPAÑAS ========== */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mis Campañas</h2>
              <Button variant="outline" size="sm" onClick={loadCampaigns} disabled={loadingCampaigns}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                Actualizar lista
              </Button>
            </div>
            {loadingCampaigns ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : campaigns.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">No hay campañas creadas aún.</CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {campaigns.map(camp => (
                  <Card key={camp.id} className="overflow-hidden border-border bg-card/50">
                    <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-foreground">{camp.name}</h3>
                          <Badge variant={camp.status === 'completed' ? 'default' : camp.status === 'running' ? 'secondary' : 'outline'}>
                            {camp.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Creada: {new Date(camp.created_at).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {camp.contacts.length} contactos
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bot className="h-3 w-3" /> Asistente: {camp.assistant_id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button 
                          onClick={() => executeCampaign(camp)} 
                          disabled={camp.status === 'running'}
                          className={`flex-1 md:flex-none ${camp.status === 'running' ? 'animate-pulse' : ''}`}
                        >
                          {camp.status === 'running' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                          {camp.status === 'completed' ? 'Volver a lanzar' : 'Ejecutar ahora'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'calls' && (
          <div className="space-y-5">
            {/* Sub-tabs de agentes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SPECIALIZED_AGENTS.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => setAgentTab(ag.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                    agentTab === ag.id
                      ? `${ag.bg} ${ag.color} border-current shadow-md scale-[1.02]`
                      : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/40'
                  }`}
                >
                  <span className={`p-2 rounded-full ${agentTab === ag.id ? ag.bg : 'bg-muted'}`}>
                    {ag.icon}
                  </span>
                  <span className="text-center leading-tight">{ag.label}</span>
                  {ag.vapiId && (
                    <span className="text-[10px] opacity-60 font-mono">{ag.vapiId.substring(0,8)}…</span>
                  )}
                  {!ag.vapiId && (
                    <span className="text-[10px] text-amber-400 font-semibold">Sin configurar</span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel del agente activo */}
            {SPECIALIZED_AGENTS.filter(ag => ag.id === agentTab).map(ag => (
              <Card key={ag.id} className={`border-2 ${ag.bg}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${ag.bg} ${ag.color}`}>{ag.icon}</span>
                    <div>
                      <CardTitle className={ag.color}>{ag.label}</CardTitle>
                      <CardDescription className="mt-0.5">{ag.description}</CardDescription>
                    </div>
                  </div>
                  {ag.vapiId && (
                    <div className="mt-2 flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2">
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Agent ID:</span>
                      <code className="text-xs font-mono text-foreground">{ag.vapiId}</code>
                      <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">PUBLICADO</span>
                    </div>
                  )}
                  {!ag.vapiId && (
                    <div className="mt-2 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs text-amber-400">Agente VAPI pendiente de configurar — ingresa el ID en el código.</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Números a llamar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Números a llamar *</Label>
                      <label htmlFor={`file-${ag.id}`} className="cursor-pointer">
                        <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Upload className="h-3 w-3" /> Subir CSV/TXT
                        </span>
                        <input
                          id={`file-${ag.id}`}
                          type="file"
                          accept=".csv,.txt"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.name.endsWith('.csv')) {
                              Papa.parse(file, { complete: (r) => {
                                const nums = (r.data as any[]).map((row: any) => row[0]).filter(Boolean);
                                setAgentNumbers(prev => ({ ...prev, [ag.id]: prev[ag.id as AgentTab] ? `${prev[ag.id as AgentTab]}\n${nums.join('\n')}` : nums.join('\n') }));
                              }});
                            } else {
                              const reader = new FileReader();
                              reader.onload = ev => setAgentNumbers(prev => ({ ...prev, [ag.id]: prev[ag.id as AgentTab] ? `${prev[ag.id as AgentTab]}\n${ev.target?.result}` : ev.target?.result as string }));
                              reader.readAsText(file);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Un número por línea en formato E.164 (+525551234567). También acepta separados por coma.</p>
                    <textarea
                      value={agentNumbers[ag.id]}
                      onChange={e => setAgentNumbers(prev => ({ ...prev, [ag.id]: e.target.value }))}
                      placeholder={`+525551234567\n+525559876543`}
                      className="w-full min-h-[110px] p-3 rounded-md bg-background border border-border text-foreground text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {agentNumbers[ag.id].split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length > 0 && (
                      <p className={`text-sm font-medium ${ag.color}`}>
                        {agentNumbers[ag.id].split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length} número(s) detectado(s)
                      </p>
                    )}
                  </div>

                  {/* Número de origen */}
                  <div className="space-y-2">
                    <Label>Número de origen (VAPI) *</Label>
                    {phoneNumbers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Sin números.{' '}
                        <button onClick={syncPhoneNumbers} className="text-primary underline">Sincronizar</button>
                      </p>
                    ) : (
                      <select
                        value={agentPhone[ag.id]}
                        onChange={e => setAgentPhone(prev => ({ ...prev, [ag.id]: e.target.value }))}
                        className="w-full p-2 rounded-md bg-background border border-border text-foreground text-sm"
                      >
                        <option value="">— Selecciona un número —</option>
                        {phoneNumbers.map(n => (
                          <option key={n.vapi_phone_number_id} value={n.vapi_phone_number_id}>
                            {n.friendly_name} {n.phone_number ? `(${n.phone_number})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <Button
                    onClick={() => handleAgentCall(ag.id)}
                    disabled={agentLoading[ag.id] || !ag.vapiId}
                    className="w-full h-11 text-base font-semibold"
                  >
                    {agentLoading[ag.id] ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Realizando llamadas...</>
                    ) : (
                      <><PhoneCall className="mr-2 h-5 w-5" />Llamar ahora — {ag.label}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Nueva Sección: Resúmenes y Análisis de Resultados por Agente */}
            {SPECIALIZED_AGENTS.filter(ag => ag.id === agentTab).map(ag => {
              const agentCalls = calls.filter(c => c.assistant_id === ag.vapiId);
              const totalCalls = agentCalls.length;
              const completedCalls = agentCalls.filter(c => c.status === 'completed').length;
              const failedCalls = agentCalls.filter(c => c.status === 'failed').length;
              const avgDuration = agentCalls.filter(c => c.duration_seconds).reduce((acc, c) => acc + (c.duration_seconds ?? 0), 0) / (agentCalls.filter(c => c.duration_seconds).length || 1);

              return (
                <div key={`analysis-${ag.id}`} className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className={`h-5 w-5 ${ag.color}`} />
                      Resultados y Análisis de {ag.label}
                    </h3>
                    <Button variant="outline" size="sm" onClick={loadCalls} disabled={loadingCalls}>
                      <RefreshCw className={`h-3 w-3 mr-2 ${loadingCalls ? 'animate-spin' : ''}`} />
                      Actualizar Análisis
                    </Button>
                  </div>

                  {!ag.vapiId ? (
                    <Card className="border-border">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        Por favor, configura el ID del agente VAPI para ver el análisis de resultados.
                      </CardContent>
                    </Card>
                  ) : totalCalls === 0 ? (
                    <Card className="border-border">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        Aún no se registran llamadas en el sistema para este agente ({ag.label}). Realiza una llamada para generar estadísticas.
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Métricas del Agente Activo */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-background border border-border p-4 rounded-xl space-y-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase">Llamadas Totales</p>
                          <p className="text-2xl font-bold">{totalCalls}</p>
                        </div>
                        <div className="bg-background border border-border p-4 rounded-xl space-y-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase">Completadas con Éxito</p>
                          <p className="text-2xl font-bold text-emerald-400">{completedCalls}</p>
                        </div>
                        <div className="bg-background border border-border p-4 rounded-xl space-y-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase">Duración Promedio</p>
                          <p className="text-2xl font-bold text-blue-400">{Math.round(avgDuration)}s</p>
                        </div>
                        <div className="bg-background border border-border p-4 rounded-xl space-y-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase">Tasa de Efectividad</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {Math.round((completedCalls / totalCalls) * 100)}%
                          </p>
                        </div>
                      </div>

                      {/* Análisis de Resultados Detallados de VAPI */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Listado de llamadas con análisis */}
                        <div className="md:col-span-2 space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground">Detalle de Interacciones Recientes</h4>
                          <div className="space-y-3">
                            {agentCalls.map(c => (
                              <Card key={c.id} className="border-border hover:border-muted-foreground/30 transition-all">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <p className="font-semibold text-sm">{c.destination}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(c.created_at).toLocaleString('es-MX')} · {c.duration_seconds ? `${c.duration_seconds}s` : 'Sin duración'}
                                      </p>
                                    </div>
                                    <StatusBadge status={c.status} />
                                  </div>

                                  {c.summary && (
                                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Resumen de Vapi</p>
                                      <p className="text-xs text-foreground leading-relaxed">{c.summary}</p>
                                    </div>
                                  )}

                                  {c.ended_reason && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded w-fit">
                                      <span className="font-semibold">Razón fin:</span>
                                      <span className="font-mono text-[11px]">{c.ended_reason}</span>
                                    </div>
                                  )}

                                  {c.recording_url && (
                                    <div className="pt-1 flex items-center justify-between">
                                      <audio src={c.recording_url} controls className="h-8 max-w-full" />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Análisis de Tendencias y Resultados */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-muted-foreground">Análisis de la IA</h4>
                          <Card className="border-border">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" />
                                Diagnóstico de Interacción
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-4 text-xs">
                              {/* Motivos de Finalización Comunes */}
                              <div className="space-y-2">
                                <p className="font-medium text-muted-foreground uppercase text-[10px]">Patrones de Cierre de Llamada</p>
                                <div className="space-y-1">
                                  {Array.from(new Set(agentCalls.map(c => c.ended_reason).filter(Boolean))).map(reason => {
                                    const count = agentCalls.filter(c => c.ended_reason === reason).length;
                                    const percentage = Math.round((count / totalCalls) * 100);
                                    return (
                                      <div key={reason} className="flex justify-between items-center bg-muted/40 px-2 py-1 rounded">
                                        <span className="font-mono truncate max-w-[150px]">{reason}</span>
                                        <span className="font-semibold">{percentage}% ({count})</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Análisis de Resultados del Agente */}
                              <div className="space-y-2 pt-2 border-t border-border">
                                <p className="font-medium text-muted-foreground uppercase text-[10px]">Indicadores Clave VAPI</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Tasa de Respuesta:</span>
                                    <span className="font-bold">{Math.round((agentCalls.filter(c => c.status !== 'failed').length / totalCalls) * 100)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Llamadas &gt; 30 Segundos:</span>
                                    <span className="font-bold">{Math.round((agentCalls.filter(c => (c.duration_seconds ?? 0) > 30).length / totalCalls) * 100)}%</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ========== TAB: HISTORIAL ========== */}
        {activeTab === 'history' && (
          <Card className="border-border">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Historial de Llamadas</CardTitle>
                <CardDescription>Registro completo de todas las llamadas realizadas con VAPI.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadCalls} disabled={loadingCalls}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingCalls ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </CardHeader>
            <CardContent>
              {loadingCalls ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : calls.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No hay llamadas registradas aún.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {calls.map(call => (
                    <div key={call.id} className="border border-border rounded-lg overflow-hidden">
                      <button
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{call.destination}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(call.created_at).toLocaleString('es-MX')}
                              {call.duration_seconds ? ` · ${call.duration_seconds}s` : ''}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={call.status} />
                      </button>

                      {expandedCall === call.id && (
                        <div className="border-t border-border p-4 space-y-3 bg-muted/30">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-muted-foreground">
                              {call.vapi_call_id ? <span className="font-mono">{call.vapi_call_id}</span> : null}
                            </div>
                            {call.vapi_call_id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); syncCallDetails(call.vapi_call_id); }}
                                disabled={syncingCallId === call.vapi_call_id}
                              >
                                <RefreshCw className={`h-3 w-3 mr-2 ${syncingCallId === call.vapi_call_id ? 'animate-spin' : ''}`} />
                                Sincronizar con VAPI
                              </Button>
                            )}
                          </div>

                          {(() => {
                            const analysis = (call.raw_event as any)?.analysis ?? call.intent ?? null;
                            const sentiment = analysis?.sentiment?.overall ?? analysis?.sentiment?.label ?? analysis?.sentiment ?? null;
                            const sentimentScore = analysis?.sentiment?.score ?? analysis?.sentiment?.overallScore ?? null;
                            const cost = (call.raw_event as any)?.cost ?? (call.raw_event as any)?.costs?.total ?? (call.raw_event as any)?.billing?.totalCost ?? null;
                            const duration = (call.raw_event as any)?.durationSeconds ?? (call.raw_event as any)?.duration ?? call.duration_seconds ?? null;
                            const endedReason = (call.raw_event as any)?.endedReason ?? call.ended_reason ?? null;

                            if (!analysis && !(call.raw_event as any)) return null;

                            return (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">MÉTRICAS (VAPI)</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div className="p-2 rounded-md border border-border bg-background">
                                    <p className="text-[10px] text-muted-foreground uppercase">Duración</p>
                                    <p className="text-sm font-semibold">{duration != null ? `${duration}s` : '—'}</p>
                                  </div>
                                  <div className="p-2 rounded-md border border-border bg-background">
                                    <p className="text-[10px] text-muted-foreground uppercase">Sentimiento</p>
                                    <p className="text-sm font-semibold">
                                      {sentiment != null ? String(sentiment) : '—'}
                                      {sentimentScore != null ? <span className="text-xs text-muted-foreground"> · {String(sentimentScore)}</span> : null}
                                    </p>
                                  </div>
                                  <div className="p-2 rounded-md border border-border bg-background">
                                    <p className="text-[10px] text-muted-foreground uppercase">Costo</p>
                                    <p className="text-sm font-semibold">{cost != null ? String(cost) : '—'}</p>
                                  </div>
                                  <div className="p-2 rounded-md border border-border bg-background">
                                    <p className="text-[10px] text-muted-foreground uppercase">Cierre</p>
                                    <p className="text-sm font-semibold">{endedReason != null ? String(endedReason) : '—'}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {call.summary && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">RESUMEN</p>
                              <p className="text-sm">{call.summary}</p>
                            </div>
                          )}
                          {call.transcript && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">TRANSCRIPCIÓN</p>
                              <p className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{call.transcript}</p>
                            </div>
                          )}
                          {call.ended_reason && (
                            <p className="text-xs text-muted-foreground">Motivo de finalización: <span className="font-mono">{call.ended_reason}</span></p>
                          )}
                          {call.recording_url && (
                            <a
                              href={call.recording_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Play className="h-4 w-4" /> Reproducir grabación
                            </a>
                          )}

                          {call.raw_event && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">DATOS COMPLETOS (VAPI)</p>
                              <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto p-3 rounded-md border border-border bg-background">
                                {JSON.stringify(call.raw_event, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
