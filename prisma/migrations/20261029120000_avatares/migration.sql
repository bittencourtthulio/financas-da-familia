-- AlterTable: o avatar desenhado de cada pessoa da família (JSON pequeno, nulo até escolher)
ALTER TABLE "usuarios" ADD COLUMN "avatar" TEXT;

-- AlterTable
ALTER TABLE "filhos" ADD COLUMN "avatar" TEXT;
