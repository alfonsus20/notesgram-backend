-- CreateTable
CREATE TABLE "topup_transactions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topup_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "topup_transactions" ADD CONSTRAINT "topup_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
