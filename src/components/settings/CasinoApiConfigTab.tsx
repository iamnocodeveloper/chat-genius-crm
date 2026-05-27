import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Building, Globe, Key, User, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CasinoApiConfig {
  id: string;
  user_id: string;
  name: string;
  api_base_url: string | null;
  api_key: string | null;
  agent_username: string | null;
  parent_id: string | null;
  skin_id: string | null;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const CasinoApiConfigTab = () => {
  const { effectiveUserId } = useEffectiveUserId();
  const [configs, setConfigs] = useState<CasinoApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<CasinoApiConfig | null>(null);
  const [form, setForm] = useState({
    name: '',
    api_base_url: '',
    api_key: '',
    agent_username: '',
    parent_id: '',
    skin_id: '',
    webhook_url: '',
  });

  useEffect(() => {
    if (effectiveUserId) loadConfigs();
  }, [effectiveUserId]);

  const loadConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('casino_api_configs')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error loading casino configs:', error);
    } else {
      setConfigs((data as CasinoApiConfig[]) || []);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', api_base_url: '', api_key: '', agent_username: '', parent_id: '', skin_id: '', webhook_url: '' });
    setShowDialog(true);
  };

  const openEdit = (config: CasinoApiConfig) => {
    setEditing(config);
    setForm({
      name: config.name,
      api_base_url: config.api_base_url || '',
      api_key: config.api_key || '',
      agent_username: config.agent_username || '',
      parent_id: config.parent_id || '',
      skin_id: config.skin_id || '',
      webhook_url: config.webhook_url || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !effectiveUserId) return;

    const payload = {
      name: form.name,
      api_base_url: form.api_base_url || null,
      api_key: form.api_key || null,
      agent_username: form.agent_username || null,
      parent_id: form.parent_id || null,
      skin_id: form.skin_id || null,
      webhook_url: form.webhook_url || null,
    };

    if (editing) {
      const { error } = await supabase
        .from('casino_api_configs')
        .update(payload)
        .eq('id', editing.id);
      if (error) {
        toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
        return;
      }
      toast({ title: 'Actualizado', description: 'Configuración actualizada correctamente' });
    } else {
      const { error } = await supabase
        .from('casino_api_configs')
        .insert({ ...payload, user_id: effectiveUserId });
      if (error) {
        toast({ title: 'Error', description: 'No se pudo crear', variant: 'destructive' });
        return;
      }
      toast({ title: 'Creado', description: 'Configuración de API creada correctamente' });
    }

    setShowDialog(false);
    loadConfigs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('casino_api_configs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
      return;
    }
    toast({ title: 'Eliminado' });
    loadConfigs();
  };

  const handleToggleActive = async (config: CasinoApiConfig) => {
    const { error } = await supabase
      .from('casino_api_configs')
      .update({ is_active: !config.is_active })
      .eq('id', config.id);
    if (!error) {
      setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Configuración de APIs de Casino</h2>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva API
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Configura múltiples APIs de casino y asígnalas a cada espacio de trabajo.
      </p>

      {configs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay APIs configuradas</p>
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Configurar primera API
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <Card key={config.id} className={!config.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{config.name}</h3>
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        {config.api_base_url && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {config.api_base_url}
                          </span>
                        )}
                        {config.agent_username && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {config.agent_username}
                          </span>
                        )}
                        {config.webhook_url && (
                          <span className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            Webhook configurado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={() => handleToggleActive(config)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(config.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar API de Casino' : 'Nueva API de Casino'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: API Casino 1" />
            </div>
            <div className="space-y-2">
              <Label>URL Base de la API</Label>
              <Input value={form.api_base_url} onChange={e => setForm(p => ({ ...p, api_base_url: e.target.value }))} placeholder="https://api.example.com" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input value={form.api_key} onChange={e => setForm(p => ({ ...p, api_key: e.target.value }))} placeholder="API Key" type="password" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agent Username</Label>
                <Input value={form.agent_username} onChange={e => setForm(p => ({ ...p, agent_username: e.target.value }))} placeholder="agentegeneral1" />
              </div>
              <div className="space-y-2">
                <Label>Parent ID</Label>
                <Input value={form.parent_id} onChange={e => setForm(p => ({ ...p, parent_id: e.target.value }))} placeholder="Parent ID" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Skin ID</Label>
              <Input value={form.skin_id} onChange={e => setForm(p => ({ ...p, skin_id: e.target.value }))} placeholder="Skin ID" />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL (n8n u otro)</Label>
              <Input value={form.webhook_url} onChange={e => setForm(p => ({ ...p, webhook_url: e.target.value }))} placeholder="https://n8n.example.com/webhook/..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasinoApiConfigTab;
