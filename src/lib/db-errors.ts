import { Prisma } from "@prisma/client";

export function getDatabaseErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return "Database tables are missing. Run npm run db:push and npm run db:seed on production.";
    }
    if (error.code === "P1001") {
      return "Cannot reach the database. Check DATABASE_URL on Vercel.";
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database connection failed. Set a cloud DATABASE_URL on Vercel (not localhost).";
  }

  return null;
}
