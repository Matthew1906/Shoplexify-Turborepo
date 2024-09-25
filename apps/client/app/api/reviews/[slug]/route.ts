'use server'

import prisma from "@/app/lib/prisma"
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server"

export async function GET(req:NextRequest, {params}:{params:{slug:string}}){
    try {
        const sessionData = await getServerSession();
        const slug = params.slug;
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user){
                return Response.json({ status:false }, { status:404 });
            } 
            const product = await prisma.products.findFirst({where:{slug:slug}});
            if(!product){
                return Response.json({ status:false }, { status:404 });
            }
            const productTransactionCount = await prisma.transaction_details.count({
                where:{
                    product_id: product?.id,
                    transactions:{
                        user_id:user?.id,
                        delivery_status:"Delivered",
                        payment_status:"Paid"
                    }
                }
            });
            const hasPurchased = productTransactionCount>0;
            const review = await prisma.reviews.findFirst({
                where:{
                    product_id:product?.id,
                    user_id:user?.id
                }
            })
            return Response.json({ review, hasPurchased, status:true }, { status:200 })
        }
        return Response.json({ status:false }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}