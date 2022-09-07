-- CreateTable
CREATE TABLE "PostLikes" (
    "id" SERIAL NOT NULL,
    "likerId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLikes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_likerId_fkey" FOREIGN KEY ("likerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
