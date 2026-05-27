import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Briefcase, GripVertical, Building, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { embudoServices } from '@/services/embudoServices';
import { Badge } from '@/components/ui/badge';

type Workspace = Tables<'workspaces'> & { channel_type?: string; casino_api_config_id?: string | null };
type LeadColumn = Tables<'lead_columns'>;

const CHANNEL_TYPES = [
  { value: 'whatsapp', label: 'WhatsApp', color: 'bg-green-500' },
  { value: 'twilio', label: 'Twilio', color: 'bg-red-500' },
  { value: 'webchat', label: 'WebChat', color: 'bg-blue-500' },
  { value: 'telegram', label: 'Telegram', color: 'bg-sky-500' },
  { value: 'all', label: 'Todos', color: 'bg-purple-500' }
];

const CASINO_API_NONE = '__none__';

const WorkspaceManagement = () => {
  const { user } = useAuth();
  const { effectiveUserId, loading: effectiveUserLoading } = useEffectiveUserId();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [columns, setColumns] = useState<LeadColumn[]>([]);
  const [casinoApiConfigs, setCasinoApiConfigs] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkspaceDialog, setShowWorkspaceDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editingColumn, setEditingColumn] = useState<LeadColumn | null>(null);
  const [workspaceChannelType, setWorkspaceChannelType] = useState('whatsapp');
  const [workspaceCasinoApiId, setWorkspaceCasinoApiId] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceIsDefault, setWorkspaceIsDefault] = useState(false);
  const [firstFunnelName, setFirstFunnelName] = useState('Nuevos Contactos');
  const [columnName, setColumnName] = useState('');
  const [columnColor, setColumnColor] = useState('#3b82f6');

  useEffect(() => {
    if (user && effectiveUserId) {
      loadData();
    }
  }, [user, effectiveUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadWorkspaces(), loadColumns(), loadCasinoApiConfigs()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', effectiveUserId)
      .order('position');

    if (error) {
      console.error('Error loading workspaces:', error);
      return;
    }

    setWorkspaces(data || []);
  };

  const loadColumns = async () => {
    const { data, error } = await supabase
      .from('lead_columns')
      .select('*')
      .eq('user_id', effectiveUserId)
      .order('position');

    if (error) {
      console.error('Error loading columns:', error);
      return;
    }

    setColumns(data || []);
  };

  const loadCasinoApiConfigs = async () => {
    const { data, error } = await supabase
      .from('casino_api_configs')
      .select('id, name')
      .eq('user_id', effectiveUserId)
      .eq('is_active', true);

    if (!error && data) {
      setCasinoApiConfigs(data);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;

    // If setting as default, clear other defaults first
    if (workspaceIsDefault) {
      await supabase
        .from('workspaces')
        .update({ is_default: false })
        .eq('user_id', effectiveUserId);
    }

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: workspaceName,
        position: workspaces.length,
        user_id: effectiveUserId,
        channel_type: workspaceChannelType,
        casino_api_config_id: workspaceCasinoApiId,
        is_default: workspaceIsDefault
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Error al crear el espacio de trabajo",
        variant: "destructive"
      });
      return;
    }

    // Auto-create first funnel column
    const funnelName = firstFunnelName.trim() || 'Nuevos Contactos';
    await supabase.from('lead_columns').insert({
      user_id: effectiveUserId,
      workspace_id: data.id,
      name: funnelName,
      color: '#22c55e',
      position: 0,
      is_default: true
    });

    // Update local state for is_default
    if (workspaceIsDefault) {
      setWorkspaces([...workspaces.map(ws => ({ ...ws, is_default: false })), data]);
    } else {
      setWorkspaces([...workspaces, data]);
    }
    await loadColumns();
    setWorkspaceName('');
    setWorkspaceChannelType('whatsapp');
    setWorkspaceCasinoApiId(null);
    setWorkspaceIsDefault(false);
    setFirstFunnelName('Nuevos Contactos');
    setShowWorkspaceDialog(false);
    toast({
      title: "Éxito",
      description: "Espacio de trabajo creado correctamente"
    });
  };

  const handleUpdateWorkspace = async () => {
    if (!editingWorkspace || !workspaceName.trim()) return;

    // If setting as default, clear other defaults first
    if (workspaceIsDefault && !editingWorkspace.is_default) {
      await supabase
        .from('workspaces')
        .update({ is_default: false })
        .eq('user_id', effectiveUserId);
    }

      const { error } = await supabase
        .from('workspaces')
        .update({ 
          name: workspaceName, 
          channel_type: workspaceChannelType,
          casino_api_config_id: workspaceCasinoApiId,
          is_default: workspaceIsDefault
        })
      .eq('id', editingWorkspace.id);

    if (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el espacio de trabajo",
        variant: "destructive"
      });
      return;
    }

      setWorkspaces(workspaces.map(ws => {
        if (ws.id === editingWorkspace.id) {
          return { ...ws, name: workspaceName, channel_type: workspaceChannelType, casino_api_config_id: workspaceCasinoApiId, is_default: workspaceIsDefault };
        }
        // If we just set this one as default, clear others
        if (workspaceIsDefault) {
          return { ...ws, is_default: false };
        }
        return ws;
      }));
    setEditingWorkspace(null);
    setWorkspaceName('');
    setWorkspaceCasinoApiId(null);
    setWorkspaceIsDefault(false);
    setShowWorkspaceDialog(false);
    toast({
      title: "Éxito",
      description: "Espacio de trabajo actualizado correctamente"
    });
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el espacio de trabajo",
        variant: "destructive"
      });
      return;
    }

    setWorkspaces(workspaces.filter(ws => ws.id !== workspaceId));
    toast({
      title: "Éxito",
      description: "Espacio de trabajo eliminado correctamente"
    });
  };

  const handleCreateColumn = async () => {
    if (!columnName.trim() || !selectedWorkspace) return;

    const workspaceColumns = columns.filter(col => col.workspace_id === selectedWorkspace);

    const { data, error } = await supabase
      .from('lead_columns')
      .insert({
        name: columnName,
        color: columnColor,
        position: workspaceColumns.length,
        workspace_id: selectedWorkspace,
        user_id: effectiveUserId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating column:', error);
      toast({
        title: "Error",
        description: "Error al crear el embudo",
        variant: "destructive"
      });
      return;
    }

    setColumns([...columns, data]);
    setColumnName('');
    setColumnColor('#3b82f6');
    setShowColumnDialog(false);
    toast({
      title: "Éxito",
      description: "Embudo creado correctamente"
    });
  };

  const handleUpdateColumn = async () => {
    if (!editingColumn || !columnName.trim()) return;

    const { error } = await supabase
      .from('lead_columns')
      .update({
        name: columnName,
        color: columnColor
      })
      .eq('id', editingColumn.id);

    if (error) {
      console.error('Error updating column:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el embudo",
        variant: "destructive"
      });
      return;
    }

    setColumns(columns.map(col => 
      col.id === editingColumn.id 
        ? { ...col, name: columnName, color: columnColor }
        : col
    ));
    setEditingColumn(null);
    setColumnName('');
    setColumnColor('#3b82f6');
    setShowColumnDialog(false);
    toast({
      title: "Éxito",
      description: "Embudo actualizado correctamente"
    });
  };

  const handleDeleteColumn = async (columnId: string) => {
    const { error } = await supabase
      .from('lead_columns')
      .delete()
      .eq('id', columnId);

    if (error) {
      console.error('Error deleting column:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el embudo",
        variant: "destructive"
      });
      return;
    }

    setColumns(columns.filter(col => col.id !== columnId));
    toast({
      title: "Éxito",
      description: "Embudo eliminado correctamente"
    });
  };

  const openCreateWorkspaceDialog = () => {
    setEditingWorkspace(null);
    setWorkspaceName('');
    setWorkspaceChannelType('whatsapp');
    setWorkspaceCasinoApiId(null);
    setWorkspaceIsDefault(false);
    setFirstFunnelName('Nuevos Contactos');
    setShowWorkspaceDialog(true);
  };

  const openEditWorkspaceDialog = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setWorkspaceName(workspace.name);
    setWorkspaceChannelType(workspace.channel_type || 'whatsapp');
    setWorkspaceCasinoApiId(workspace.casino_api_config_id || null);
    setWorkspaceIsDefault(workspace.is_default || false);
    setShowWorkspaceDialog(true);
  };

  const openCreateColumnDialog = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId);
    setEditingColumn(null);
    setColumnName('');
    setColumnColor('#3b82f6');
    setShowColumnDialog(true);
  };

  const openEditColumnDialog = (column: LeadColumn) => {
    setEditingColumn(column);
    setColumnName(column.name);
    setColumnColor(column.color || '#3b82f6');
    setShowColumnDialog(true);
  };

  const getWorkspaceColumns = (workspaceId: string) => {
    return columns
      .filter(col => col.workspace_id === workspaceId)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragEnd = async (result: DropResult, workspaceId: string) => {
    const { destination, source } = result;

    // Si no hay destino o no se movió, salir
    if (!destination) return;
    if (destination.index === source.index) return;

    // Obtener las columnas del workspace actual
    const workspaceColumns = getWorkspaceColumns(workspaceId);
    
    // Reordenar el array localmente
    const reorderedColumns = Array.from(workspaceColumns);
    const [movedColumn] = reorderedColumns.splice(source.index, 1);
    reorderedColumns.splice(destination.index, 0, movedColumn);

    // Actualizar posiciones
    const updates = reorderedColumns.map((col, index) => ({
      id: col.id,
      position: index
    }));

    // Actualización optimista del estado local
    const updatedColumns = columns.map(col => {
      const update = updates.find(u => u.id === col.id);
      return update ? { ...col, position: update.position } : col;
    });
    setColumns(updatedColumns);

    // Persistir en la base de datos
    const result2 = await embudoServices.updateEmbudoPositions(updates);
    
    if (!result2.success) {
      // Revertir si hay error
      await loadColumns();
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden de los embudos",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Orden actualizado",
      description: "Los embudos se han reordenado correctamente"
    });
  };

  if (loading || effectiveUserLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando espacios de trabajo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Espacios de trabajo</h2>
        </div>
        <Button onClick={openCreateWorkspaceDialog} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Espacio
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Crear, editar y eliminar tus espacios de trabajo y embudos
      </p>

      {workspaces.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No hay espacios de trabajo creados aún
            </p>
            <Button onClick={openCreateWorkspaceDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear primer espacio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5" />
                    <h3 className="text-lg font-semibold uppercase">{workspace.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                      CHANNEL_TYPES.find(c => c.value === workspace.channel_type)?.color || 'bg-gray-500'
                    }`}>
                      {CHANNEL_TYPES.find(c => c.value === workspace.channel_type)?.label || 'WhatsApp'}
                    </span>
                    {workspace.casino_api_config_id && (
                      <Badge variant="outline" className="text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        Casino API
                      </Badge>
                    )}
                    {workspace.is_default && (
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Predeterminado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditWorkspaceDialog(workspace)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkspace(workspace.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>

                <DragDropContext onDragEnd={(result) => handleDragEnd(result, workspace.id)}>
                  <Droppable droppableId={`workspace-${workspace.id}`} direction="horizontal">
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-wrap gap-4 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg p-2' : ''}`}
                      >
                        {getWorkspaceColumns(workspace.id).map((column, index) => (
                          <Draggable key={column.id} draggableId={column.id} index={index}>
                            {(provided, snapshot) => (
                              <Card 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-2 w-[200px] transition-all ${
                                  snapshot.isDragging 
                                    ? 'shadow-xl scale-105 rotate-2' 
                                    : 'hover:border-primary'
                                }`}
                                style={{ 
                                  borderColor: column.color || '#3b82f6',
                                  ...provided.draggableProps.style 
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                                      >
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="text-lg font-bold">{index + 1}</p>
                                        <p className="text-sm font-medium">{column.name}</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => openEditColumnDialog(column)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleDeleteColumn(column.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        <Card 
                          className="border-2 border-dashed border-border/50 cursor-pointer hover:border-primary transition-colors w-[200px]"
                          onClick={() => openCreateColumnDialog(workspace.id)}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[100px]">
                            <Plus className="h-8 w-8 text-orange-500 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">Agregar Embudo</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Workspace Dialog */}
      <Dialog open={showWorkspaceDialog} onOpenChange={setShowWorkspaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkspace ? 'Editar Espacio de Trabajo' : 'Nuevo Espacio de Trabajo'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkspace 
                ? 'Modifica el nombre del espacio de trabajo'
                : 'Crea un nuevo espacio de trabajo para organizar tus embudos'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Nombre del Espacio</Label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Ej: Ventas, Marketing, Soporte"
              />
            </div>
            {!editingWorkspace && (
              <div className="space-y-2">
                <Label htmlFor="first-funnel-name">Nombre del primer embudo</Label>
                <Input
                  id="first-funnel-name"
                  value={firstFunnelName}
                  onChange={(e) => setFirstFunnelName(e.target.value)}
                  placeholder="Ej: Nuevos Contactos"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Espacio predeterminado</Label>
                <p className="text-xs text-muted-foreground">Se abrirá por defecto al entrar a Embudos</p>
              </div>
              <Switch
                checked={workspaceIsDefault}
                onCheckedChange={setWorkspaceIsDefault}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Canal</Label>
              <div className="grid grid-cols-2 gap-2">
                {CHANNEL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setWorkspaceChannelType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      workspaceChannelType === type.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${type.color}`}></span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>API de Casino (Opcional)</Label>
              <Select
                value={workspaceCasinoApiId ?? CASINO_API_NONE}
                onValueChange={(val) => setWorkspaceCasinoApiId(val === CASINO_API_NONE ? null : val)}
                disabled={casinoApiConfigs.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin API seleccionada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CASINO_API_NONE}>Sin API</SelectItem>
                  {casinoApiConfigs.map((api) => (
                    <SelectItem key={api.id} value={api.id}>{api.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {casinoApiConfigs.length === 0 && (
                <p className="text-xs text-muted-foreground">No hay APIs de casino activas.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkspaceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={editingWorkspace ? handleUpdateWorkspace : handleCreateWorkspace}>
              {editingWorkspace ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Dialog */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className="bg-[#2a3942] border-[#3e4c59] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {editingColumn ? 'Editar embudo' : 'Agregar embudo'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Icono de edición centrado */}
          <div className="flex justify-center py-4">
            <div className="w-16 h-16 rounded-lg bg-[#202c33] flex items-center justify-center">
              <Edit className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Campo de nombre con badge */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 bg-[#202c33] rounded-lg px-4 py-3">
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {editingColumn ? columns.findIndex(c => c.id === editingColumn.id) + 1 : columns.filter(c => c.workspace_id === selectedWorkspace).length + 1}
                </span>
                <Input
                  id="column-name"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  placeholder="Nombre del embudo"
                  className="flex-1 border-0 bg-transparent text-white placeholder:text-gray-500 focus-visible:ring-0 px-0 uppercase"
                />
              </div>
            </div>

            {/* Sección de colores */}
            <div className="space-y-3">
              <Label className="text-white text-lg font-semibold">Color</Label>
              <div className="grid grid-cols-9 gap-2">
                {/* Fila 1: Verdes */}
                {['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0891b2', '#0284c7', '#3b82f6', '#2563eb', '#1d4ed8'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColumnColor(color)}
                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                      columnColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2a3942]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                
                {/* Fila 2: Purples y Magentas */}
                {['#8b5cf6', '#7c3aed', '#a855f7', '#d946ef', '#ec4899', '#db2777', '#ef4444', '#f87171', '#fb923c'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColumnColor(color)}
                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                      columnColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2a3942]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                
                {/* Fila 3: Rojos y Naranjas */}
                {['#dc2626', '#b91c1c', '#b45309', '#d97706', '#f59e0b', '#f97316', '#fb923c', '#fbbf24', '#facc15'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColumnColor(color)}
                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                      columnColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2a3942]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                
                {/* Fila 4: Grises y Negro */}
                {['#ffffff', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#000000'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColumnColor(color)}
                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                      columnColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2a3942]' : ''
                    } ${color === '#ffffff' ? 'border border-gray-600' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              onClick={editingColumn ? handleUpdateColumn : handleCreateColumn}
              className="w-full bg-[#00a884] hover:bg-[#00a884]/90 text-white font-medium py-3 rounded-lg"
            >
              <Edit className="h-4 w-4 mr-2" />
              {editingColumn ? 'Editar embudo' : 'Agregar embudo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceManagement;
