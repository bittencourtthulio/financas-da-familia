-- AlterTable: quem da família fez o gasto (id do usuário adulto ou do filho; nulo = sem pessoa)
ALTER TABLE "lancamentos" ADD COLUMN "pessoaId" TEXT;

-- CreateIndex
CREATE INDEX "lancamentos_pessoaId_idx" ON "lancamentos"("pessoaId");
