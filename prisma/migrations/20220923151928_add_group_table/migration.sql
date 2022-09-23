-- CreateTable
CREATE TABLE "note_bookmarked_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "note_bookmarked_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_purchased_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "note_purchased_groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "note_bookmarked_groups" ADD CONSTRAINT "note_bookmarked_groups_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_purchased_groups" ADD CONSTRAINT "note_purchased_groups_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
