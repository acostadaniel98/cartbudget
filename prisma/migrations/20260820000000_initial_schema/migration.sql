CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "ItemStatus" AS ENUM ('pendiente', 'comprado', 'no_encontrado');

CREATE TABLE "shopping_lists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "presupuesto" DECIMAL(12,2),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "es_plantilla" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shopping_items" (
    "id" UUID NOT NULL,
    "shopping_list_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "precio_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL,
    "estado" "ItemStatus" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "fecha_compra" TIMESTAMP(3),
    CONSTRAINT "shopping_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "frequent_products" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nombre_normalizado" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "frecuencia" INTEGER NOT NULL DEFAULT 1,
    "ultimo_precio_unitario" DECIMAL(12,2),
    "ultima_cantidad" DECIMAL(12,3),
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "frequent_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "personalizada" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shopping_lists_user_id_fecha_creacion_idx" ON "shopping_lists"("user_id", "fecha_creacion");
CREATE INDEX "shopping_lists_user_id_es_plantilla_fecha_actualizacion_idx" ON "shopping_lists"("user_id", "es_plantilla", "fecha_actualizacion");
CREATE INDEX "shopping_items_shopping_list_id_orden_idx" ON "shopping_items"("shopping_list_id", "orden");
CREATE INDEX "shopping_items_shopping_list_id_estado_idx" ON "shopping_items"("shopping_list_id", "estado");
CREATE INDEX "frequent_products_user_id_frecuencia_idx" ON "frequent_products"("user_id", "frecuencia");
CREATE UNIQUE INDEX "frequent_products_user_id_nombre_normalizado_key" ON "frequent_products"("user_id", "nombre_normalizado");
CREATE INDEX "categories_user_id_orden_idx" ON "categories"("user_id", "orden");
CREATE UNIQUE INDEX "categories_user_id_nombre_key" ON "categories"("user_id", "nombre");

ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;