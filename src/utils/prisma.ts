import { PrismaClient } from "@prisma/client";

const getPrismaSingleton = ()=>{
    return new PrismaClient();
}

const prisma = globalThis.prismaGlobal ?? getPrismaSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma