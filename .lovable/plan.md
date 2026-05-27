# Editor de firma de email mejorado

Mejorar el campo "Firma" en `src/pages/EmailInboxes.tsx` (línea ~618) reemplazando el `Textarea` plano por un componente con tres modos en pestañas y plantillas listas para usar.

## Componente nuevo

Crear `src/components/email/SignatureEditor.tsx` con `Tabs` de shadcn:

1. **Rich Text** (por defecto)
   - Editor WYSIWYG con `contentEditable` controlado y barra de herramientas: negritas, cursiva, subrayado, enlace, lista, alineación, color, tamaño, limpiar formato.
   - Usa `document.execCommand` (consistente y sin nuevas dependencias pesadas) y sincroniza el HTML resultante con el estado.

2. **HTML**
   - Editor de código con `Textarea` de fuente monoespaciada + resaltado simple (className `font-mono`), botón "Formatear" y validación básica de etiquetas.
   - Detecta automáticamente si la firma actual contiene `<` y `>` para sugerir este modo.

3. **Vista previa**
   - Renderiza la firma en un contenedor aislado (`iframe` con `sandbox` para evitar ejecución de scripts) tal como se verá en un correo.

## Plantillas predefinidas

Botón "Usar plantilla" que abre un `Popover` con 4 firmas HTML listas (minimalista, corporativa con logo placeholder, con redes sociales, una sola línea). Al elegir una, rellena el editor en modo HTML.

## Integración

En `EmailInboxes.tsx`:
- Reemplazar el `<Textarea>` de firma por `<SignatureEditor value={signatureText} onChange={setSignatureText} />`.
- El valor sigue guardándose en `signature_text` como string (HTML o texto plano según el modo usado), sin tocar el guardado existente en `handleSaveInbox`.

## Notas técnicas

- Sin dependencias nuevas: se usa `contentEditable` + `execCommand` y componentes shadcn ya disponibles (`Tabs`, `Popover`, `Button`, `Textarea`, `Toggle`).
- El `iframe` de previsualización usa `srcDoc` con `sandbox=""` (sin permisos) por seguridad.
- Diseño con tokens semánticos del design system, sin colores hardcoded.
