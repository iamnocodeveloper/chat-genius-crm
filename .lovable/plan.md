# Plan: notificaciones clicables, sonido e indicadores de mensajes sin leer

## Objetivo

Mejorar la atención del usuario cuando llega un mensaje nuevo:

- Al hacer click en una notificación del topbar, abrir esa conversación dentro de Embudos.
- Reproducir un sonido breve al recibir mensajes entrantes.
- Hacer más visibles las conversaciones y mensajes sin leer en Conversaciones y Embudos.

## Cambios propuestos

### 1. Notificación del topbar clicable hacia Embudos

Actualizar el panel de campana en `Header` para que cada conversación de la lista sea clicable.

Comportamiento:

- Click en una notificación abre `/leads`.
- La pantalla de Embudos busca la conversación indicada.
- Si la conversación ya tiene lead asociado, abre el modal de chat de esa tarjeta.
- Si no encuentra la tarjeta visible por filtros/paginación, intenta cargar la conversación directamente y abre el chat igualmente.
- Al abrirse, se marca como leída usando el flujo existente.

Esto evita mandar al usuario a la pantalla general de conversaciones; lo lleva a Embudos como pediste.

### 2. Soporte en Embudos para abrir conversación desde navegación

Actualizar `Leads.tsx` para leer `location.state.conversationId` al entrar desde el topbar.

Flujo técnico:

```text
Header notification click
  -> navigate('/leads', { state: { conversationId } })
  -> Leads detecta conversationId
  -> busca lead/conversación
  -> abre ChatModal
  -> markAsRead(conversationId)
```

También se limpiará el estado de navegación luego de abrir para evitar reaperturas accidentales al refrescar o cambiar filtros.

### 3. Sonido al recibir mensajes

Agregar un sonido ligero cuando llegue un mensaje entrante por realtime.

Detalles:

- Solo sonará para mensajes `inbound` / `incoming`.
- No sonará para mensajes salientes ni mensajes enviados por el propio usuario.
- Se evitará que suene en la primera carga de datos; solo en eventos realtime nuevos.
- Se controlará el error típico de navegador cuando no permite audio hasta que el usuario interactúa con la página.
- Usaré Web Audio API para generar un tono corto, sin depender de archivos externos.

Opcionalmente, si el navegador bloquea el audio, no romperá la app; simplemente no sonará hasta que haya interacción del usuario.

### 4. Mejoras visuales para no leídos en Conversaciones

En `ConversationList` reforzar las conversaciones con `unread_count > 0`:

- Fondo sutil destacado.
- Borde izquierdo en color primario/destructivo.
- Nombre del contacto en negrita.
- Último mensaje con mayor contraste.
- Badge de cantidad sin leer más visible.
- Ícono/punto indicador para identificar rápido que requiere atención.

Manteniendo la virtualización actual para no afectar rendimiento.

### 5. Mejoras visuales para no leídos en Embudos / Kanban

En `KanbanBoard`, reforzar las tarjetas con conversaciones sin leer:

- Borde lateral o ring visual en tarjetas con `unread_count > 0`.
- Fondo sutil destacado.
- Badge de no leídos más visible.
- Texto del último mensaje con más contraste/negrita cuando hay mensajes sin leer.
- Mantener el indicador existente de `Nuevo` para virtual leads sin mezclarlo con el estado sin leer.

### 6. Ajuste de lista de notificaciones

Mejorar el menú de campana:

- Cursor y hover claro en cada item.
- Mostrar nombre, último mensaje, fecha y badge de no leídos.
- Cerrar el dropdown al seleccionar una notificación.
- Mantener botón “Limpiar” solo como limpieza visual local, sin borrar datos reales.

## Archivos a modificar

- `src/components/layout/Header.tsx`
- `src/pages/Leads.tsx`
- `src/components/KanbanBoard.tsx`
- `src/components/conversations/ConversationList.tsx`
- Posible helper nuevo, por ejemplo `src/lib/notificationSound.ts`, para aislar la lógica de audio.

## Validación

Después de implementar:

- Ejecutar build para asegurar que no haya errores TypeScript.
- Verificar que el click en la campana navegue a `/leads` y abra el chat correcto.
- Verificar que al abrir se marque como leído.
- Verificar que el sonido solo intente reproducirse en mensajes entrantes nuevos.
- Verificar que los indicadores visuales se vean tanto en Conversaciones como en Embudos sin romper la virtualización ni el drag-and-drop.