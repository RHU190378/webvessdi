-- =====================================================================
-- VESSDI · SCRIPT EXTRA · AGREGA EL SERVICIO DE PANELES SOLARES
-- Si YA ejecutaste 01-schema.sql: pega este archivo en SQL Editor y pulsa Run.
-- (Si aún no lo ejecutas, no lo necesitas: ya viene incluido en 01-schema.sql.)
-- Puedes ejecutarlo más de una vez sin duplicar nada.
-- =====================================================================
insert into public.services (slug,title,short_description,description,problem,benefits,features,applications,sort_order) values
('paneles-solares','Dimensionamiento e instalación de paneles solares','Cálculo y montaje de sistemas de paneles solares según tu consumo.',
 'Servicio de dimensionamiento e instalación de paneles solares: evaluamos tu necesidad de energía y dimensionamos e instalamos el sistema adecuado para tu proyecto.',
 'Necesidad de contar con una fuente de energía adecuada a tu consumo y a tu espacio.',
 array['Sistema dimensionado según tu necesidad','Instalación profesional','Alternativa de generación de energía'],
 array['Análisis de consumo','Dimensionamiento del sistema','Instalación y puesta en marcha'],
 array['Hogares','Comercios','Empresas e instituciones'],9)
on conflict (slug) do nothing;
