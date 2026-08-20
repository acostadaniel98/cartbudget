-- Agrega el correo de cada miembro a list_members. No existe una tabla de
-- perfiles propia ni acceso a la API admin de Supabase desde la app, así
-- que esta columna denormalizada es la única forma práctica de mostrar
-- quién colabora en cada compra. Se rellena una sola vez desde auth.users
-- para los miembros que ya existían; de ahí en adelante la aplicación la
-- escribe explícitamente al crear cada fila.
ALTER TABLE "list_members" ADD COLUMN "email" TEXT;

UPDATE "list_members" lm
SET "email" = COALESCE(au.email, '')
FROM auth.users au
WHERE au.id = lm.user_id;

UPDATE "list_members" SET "email" = '' WHERE "email" IS NULL;

ALTER TABLE "list_members" ALTER COLUMN "email" SET NOT NULL;
