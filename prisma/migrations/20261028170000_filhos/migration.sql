-- CreateTable
CREATE TABLE "filhos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "nascimento" TEXT,
    "mesadaCentavos" INTEGER NOT NULL,
    "periodicidade" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "filhos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "filhos_usuarioId_key" ON "filhos"("usuarioId");
