import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT,
  CLIENT_URL:process.env.CLIENT_URL,
  DATABASE_URL:process.env.DATABASE_URL,
  HASH_ITERATIONS:process.env.HASH_ITERATIONS,
  HASH_DIGEST:process.env.HASH_DIGEST,
  NEXTAUTH_SECRET:process.env.NEXTAUTH_SECRET!,
  IMAGEKIT_PUBLICKEY:process.env.IMAGEKIT_PUBLICKEY!,
  IMAGEKIT_PRIVATEKEY:process.env.IMAGEKIT_PRIVATEKEY!,
  IMAGEKIT_URL:process.env.IMAGEKIT_URL!,
  PAGE_LENGTH:process.env.PAGE_LENGTH
};