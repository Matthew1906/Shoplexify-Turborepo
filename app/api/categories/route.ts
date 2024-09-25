'use server'

import prisma from "@/app/lib/prisma";

export async function GET(req:Request){
    try{
        const categories = await prisma.categories.findMany();
        return Response.json({ data:categories }, { status:200 });
    } catch (error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}