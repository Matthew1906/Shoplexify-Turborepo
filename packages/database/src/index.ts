import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";

configDotenv({path:"../.env"});

const getPrismaSingleton = ()=>{
    return new PrismaClient();
}

export const prisma:PrismaClient = global.prisma ?? getPrismaSingleton();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export * from "@prisma/client"