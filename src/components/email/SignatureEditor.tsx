import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser,
  FileCode,
  LayoutTemplate,
} from 'lucide-react';

interface SignatureEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TEMPLATES: { name: string; description: string; html: string }[] = [
  {
    name: 'Minimalista',
    description: 'Solo nombre y cargo',
    html: `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; margin: 0;">
  <strong>Nombre Apellido</strong><br/>
  <span style="color: #666;">Cargo · Empresa</span>
</p>`,
  },
  {
    name: 'Corporativa',
    description: 'Con logo y datos de contacto',
    html: `<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #333;">
  <tr>
    <td style="padding-right: 16px; border-right: 2px solid #0066cc;">
      <img src="https://via.placeholder.com/80" alt="Logo" width="80" height="80" style="display:block;border-radius:8px;"/>
    </td>
    <td style="padding-left: 16px;">
      <div style="font-size: 16px; font-weight: bold; color: #0066cc;">Nombre Apellido</div>
      <div style="color: #666; margin-bottom: 8px;">Cargo · Empresa</div>
      <div>📧 <a href="mailto:email@empresa.com" style="color:#0066cc;text-decoration:none;">email@empresa.com</a></div>
      <div>📞 +00 000 000 000</div>
      <div>🌐 <a href="https://empresa.com" style="color:#0066cc;text-decoration:none;">empresa.com</a></div>
    </td>
  </tr>
</table>`,
  },
  {
    name: 'Con redes sociales',
    description: 'Incluye íconos de redes',
    html: `<div style="font-family: Arial, sans-serif; font-size: 13px; color: #333;">
  <p style="margin: 0 0 4px 0;"><strong style="font-size:15px;">Nombre Apellido</strong></p>
  <p style="margin: 0 0 8px 0; color: #666;">Cargo · Empresa</p>
  <p style="margin: 0 0 8px 0;">
    📧 email@empresa.com · 📞 +00 000 000 000
  </p>
  <p style="margin: 0;">
    <a href="#" style="color:#0066cc;text-decoration:none;margin-right:8px;">LinkedIn</a>·
    <a href="#" style="color:#0066cc;text-decoration:none;margin:0 8px;">Twitter</a>·
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:8px;">Instagram</a>
  </p>
</div>`,
  },
  {
    name: 'Una sola línea',
    description: 'Compacta para respuestas rápidas',
    html: `<p style="font-family: Arial, sans-serif; font-size: 13px; color: #555; margin: 0;">
  — <strong>Nombre Apellido</strong>, Empresa · email@empresa.com
</p>`,
  },
];

const looksLikeHtml = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);

export function SignatureEditor({ value, onChange }: SignatureEditorProps) {
  const initialTab = looksLikeHtml(value) ? 'html' : 'rich';
  const [tab, setTab] = useState<string>(initialTab);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external value into contentEditable when switching to rich tab
  useEffect(() => {
    if (tab === 'rich' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [tab, value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleRichInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = window.prompt('URL del enlace:', 'https://');
    if (url) exec('createLink', url);
  };

  const applyTemplate = (html: string) => {
    onChange(html);
    setTab('html');
  };

  const ToolbarButton = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8"
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <TabsList>
              <TabsTrigger value="rich">
                <Bold className="h-3.5 w-3.5 mr-1.5" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="html">
                <FileCode className="h-3.5 w-3.5 mr-1.5" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="preview">Vista previa</TabsTrigger>
            </TabsList>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
                  Plantillas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="end">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-2 py-1.5">
                    Elige una plantilla para empezar
                  </p>
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => applyTemplate(tpl.html)}
                      className="w-full text-left px-2 py-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="text-sm font-medium">{tpl.name}</div>
                      <div className="text-xs text-muted-foreground">{tpl.description}</div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <TabsContent value="rich" className="mt-2 space-y-2">
            <div className="flex items-center gap-0.5 p-1 border border-border rounded-md bg-muted/30 flex-wrap">
              <ToolbarButton onClick={() => exec('bold')} title="Negrita">
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('italic')} title="Cursiva">
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('underline')} title="Subrayado">
                <Underline className="h-4 w-4" />
              </ToolbarButton>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Lista">
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('insertOrderedList')} title="Lista numerada">
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <ToolbarButton onClick={() => exec('justifyLeft')} title="Izquierda">
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('justifyCenter')} title="Centro">
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('justifyRight')} title="Derecha">
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <ToolbarButton onClick={insertLink} title="Insertar enlace">
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <input
                type="color"
                title="Color de texto"
                onChange={(e) => exec('foreColor', e.target.value)}
                className="h-7 w-7 rounded cursor-pointer bg-transparent border border-border"
              />
              <select
                title="Tamaño"
                onChange={(e) => exec('fontSize', e.target.value)}
                defaultValue=""
                className="h-7 text-xs bg-background border border-border rounded px-1"
              >
                <option value="" disabled>
                  Tamaño
                </option>
                <option value="2">Pequeño</option>
                <option value="3">Normal</option>
                <option value="5">Grande</option>
                <option value="6">Muy grande</option>
              </select>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <ToolbarButton onClick={() => exec('removeFormat')} title="Quitar formato">
                <Eraser className="h-4 w-4" />
              </ToolbarButton>
            </div>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleRichInput}
              className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              suppressContentEditableWarning
            />
            <p className="text-xs text-muted-foreground">
              Usa la barra para dar formato. El contenido se guarda como HTML.
            </p>
          </TabsContent>

          <TabsContent value="html" className="mt-2 space-y-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="<p>Tu firma en HTML...</p>"
              className="min-h-[200px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Pega o edita HTML directamente. Los estilos inline son recomendados para clientes de correo.
            </p>
          </TabsContent>

          <TabsContent value="preview" className="mt-2">
            <div className="rounded-md border border-border bg-background overflow-hidden">
              <div className="px-3 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground">
                Así se verá tu firma en el correo
              </div>
              <iframe
                title="Vista previa de firma"
                sandbox=""
                srcDoc={`<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;margin:16px;color:#222;}</style></head><body>${value || '<p style="color:#999;">Sin firma definida</p>'}</body></html>`}
                className="w-full min-h-[200px] bg-background"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SignatureEditor;
