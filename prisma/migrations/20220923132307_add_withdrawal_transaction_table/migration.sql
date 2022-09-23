-- CreateTable
CREATE TABLE "withdrawal_transactions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "withdrawal_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "withdrawal_transactions" ADD CONSTRAINT "withdrawal_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
