-- CreateTable: lançamento que se repete todo mês (modelo dos meses seguintes)
CREATE TABLE "recorrencias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "diaDoMes" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "categoriaId" TEXT NOT NULL,
    "pessoaId" TEXT,
    "inicio" TEXT NOT NULL,
    "fim" TEXT,
    "geradoAte" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recorrencias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- AlterTable: situação (o que já existia nasce pago) e o vínculo com a recorrência
ALTER TABLE "lancamentos" ADD COLUMN "pago" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "lancamentos" ADD COLUMN "recorrenciaId" TEXT REFERENCES "recorrencias" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "lancamentos_recorrenciaId_idx" ON "lancamentos"("recorrenciaId");
CREATE UNIQUE INDEX "lancamentos_recorrenciaId_data_key" ON "lancamentos"("recorrenciaId", "data");
