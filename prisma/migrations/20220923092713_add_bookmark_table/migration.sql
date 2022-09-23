-- CreateTable
CREATE TABLE "post_bookmarks" (
    "id" SERIAL NOT NULL,
    "bookmarkerId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_bookmarks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_bookmarkerId_fkey" FOREIGN KEY ("bookmarkerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
