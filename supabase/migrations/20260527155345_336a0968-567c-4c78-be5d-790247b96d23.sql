CREATE TABLE public.registros_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono_cliente text,
  tipo_falla text,
  folio text UNIQUE,
  barra_signal text,
  direccion_falla text,
  falla_en_app_general text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.registros_preguntas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registros_preguntas TO authenticated;
GRANT ALL ON public.registros_preguntas TO service_role;

CREATE INDEX idx_registros_preguntas_telefono ON public.registros_preguntas(telefono_cliente);

CREATE TRIGGER update_registros_preguntas_updated_at
BEFORE UPDATE ON public.registros_preguntas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();