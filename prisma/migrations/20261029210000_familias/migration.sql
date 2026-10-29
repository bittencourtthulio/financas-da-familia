-- CreateTable: a família é o dono dos dados; quem se cadastra cria a sua
CREATE TABLE "familias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "familias_pkey" PRIMARY KEY ("id")
);

-- Banco que já tinha dados (um só dono até aqui): tudo passa a ser de uma família inicial.
INSERT INTO "familias" ("id", "nome")
SELECT 'familia-inicial', 'Minha família' WHERE EXISTS (SELECT 1 FROM "usuarios");

ALTER TABLE "usuarios" ADD COLUMN "familiaId" TEXT;
UPDATE "usuarios" SET "familiaId" = 'familia-inicial';
ALTER TABLE "usuarios" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "atividades" ADD COLUMN "familiaId" TEXT;
UPDATE "atividades" SET "familiaId" = 'familia-inicial';
ALTER TABLE "atividades" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "categorias" ADD COLUMN "familiaId" TEXT;
UPDATE "categorias" SET "familiaId" = 'familia-inicial';
ALTER TABLE "categorias" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lancamentos" ADD COLUMN "familiaId" TEXT;
UPDATE "lancamentos" SET "familiaId" = 'familia-inicial';
ALTER TABLE "lancamentos" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recorrencias" ADD COLUMN "familiaId" TEXT;
UPDATE "recorrencias" SET "familiaId" = 'familia-inicial';
ALTER TABLE "recorrencias" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "filhos" ADD COLUMN "familiaId" TEXT;
UPDATE "filhos" SET "familiaId" = 'familia-inicial';
ALTER TABLE "filhos" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "filhos" ADD CONSTRAINT "filhos_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "movimentos_de_mesada" ADD COLUMN "familiaId" TEXT;
UPDATE "movimentos_de_mesada" SET "familiaId" = 'familia-inicial';
ALTER TABLE "movimentos_de_mesada" ALTER COLUMN "familiaId" SET NOT NULL;
ALTER TABLE "movimentos_de_mesada" ADD CONSTRAINT "movimentos_de_mesada_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- O nome da categoria passa a ser único dentro da família
DROP INDEX "categorias_tipo_nome_key";
CREATE UNIQUE INDEX "categorias_familiaId_tipo_nome_key" ON "categorias"("familiaId", "tipo", "nome");

-- Índices
CREATE INDEX "usuarios_familiaId_idx" ON "usuarios"("familiaId");
CREATE INDEX "atividades_familiaId_idx" ON "atividades"("familiaId");
CREATE INDEX "recorrencias_familiaId_idx" ON "recorrencias"("familiaId");
CREATE INDEX "filhos_familiaId_idx" ON "filhos"("familiaId");
CREATE INDEX "movimentos_de_mesada_familiaId_idx" ON "movimentos_de_mesada"("familiaId");
DROP INDEX "lancamentos_data_idx";
CREATE INDEX "lancamentos_familiaId_data_idx" ON "lancamentos"("familiaId", "data");
