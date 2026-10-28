-- CreateTable
CREATE TABLE "movimentos_de_mesada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filhoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "movimentos_de_mesada_filhoId_fkey" FOREIGN KEY ("filhoId") REFERENCES "filhos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "movimentos_de_mesada_filhoId_data_idx" ON "movimentos_de_mesada"("filhoId", "data");
