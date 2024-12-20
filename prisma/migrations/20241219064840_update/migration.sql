/*
  Warnings:

  - Added the required column `appId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hubId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "appId" TEXT NOT NULL,
ADD COLUMN     "hubId" TEXT NOT NULL,
ADD COLUMN     "user" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
