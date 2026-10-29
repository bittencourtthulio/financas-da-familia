-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'usuario',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "sessoesValidasDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL,
    "atorId" TEXT NOT NULL,
    "atorNome" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "detalhe" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "categoriaId" TEXT NOT NULL,
    "pessoaId" TEXT,
    "pago" BOOLEAN NOT NULL DEFAULT true,
    "recorrenciaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filhos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nascimento" TEXT,
    "mesadaCentavos" INTEGER NOT NULL,
    "periodicidade" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "filhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentos_de_mesada" (
    "id" TEXT NOT NULL,
    "filhoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimentos_de_mesada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recorrencias" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "diaDoMes" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "categoriaId" TEXT NOT NULL,
    "pessoaId" TEXT,
    "inicio" TEXT NOT NULL,
    "fim" TEXT,
    "geradoAte" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "atividades_criadoEm_idx" ON "atividades"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_tipo_nome_key" ON "categorias"("tipo", "nome");

-- CreateIndex
CREATE INDEX "lancamentos_data_idx" ON "lancamentos"("data");

-- CreateIndex
CREATE INDEX "lancamentos_pessoaId_idx" ON "lancamentos"("pessoaId");

-- CreateIndex
CREATE INDEX "lancamentos_recorrenciaId_idx" ON "lancamentos"("recorrenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "lancamentos_recorrenciaId_data_key" ON "lancamentos"("recorrenciaId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "filhos_usuarioId_key" ON "filhos"("usuarioId");

-- CreateIndex
CREATE INDEX "movimentos_de_mesada_filhoId_data_idx" ON "movimentos_de_mesada"("filhoId", "data");

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_recorrenciaId_fkey" FOREIGN KEY ("recorrenciaId") REFERENCES "recorrencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filhos" ADD CONSTRAINT "filhos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_de_mesada" ADD CONSTRAINT "movimentos_de_mesada_filhoId_fkey" FOREIGN KEY ("filhoId") REFERENCES "filhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recorrencias" ADD CONSTRAINT "recorrencias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

