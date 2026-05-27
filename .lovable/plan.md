## Crear tabla `registros_preguntas`

Crear una tabla en Supabase para gestionar tickets de soporte, con los campos principales del nodo n8n.

### Campos
- `id` (uuid, PK, default gen_random_uuid)
- `telefono_cliente` (text)
- `tipo_falla` (text)
- `folio` (text, unique)
- `barra_signal` (text)
- `direccion_falla` (text)
- `falla_en_app_general` (text)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### Acceso
- GRANT completo a `anon`, `authenticated` y `service_role` (sin RLS, según pedido del usuario).
- **Nota:** sin RLS la tabla queda totalmente abierta vía la Data API. Confirmado por el usuario.

### Índices
- Índice en `folio` (unique) y en `telefono_cliente` para búsquedas frecuentes.

No se modifica código frontend — la tabla queda lista para ser usada desde n8n.
