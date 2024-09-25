'use server'

import { prisma } from "@repo/database"
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        const sessionData = await getServerSession();
        const formData = await req.formData();
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user){
                return Response.json({ status:false, message:"User doesn't exist" }, { status:404 });
            } 
            const productSlug = formData.get('slug')?.toString();
            const product = await prisma.products.findFirst({ where:{ slug:productSlug } });
            if(!product){
                return Response.json({ status:false, message: "Product doesn't exist" }, { status:404 });
            }
            const reviewBody = formData.get('body')?.toString()??"";
            const reviewRating = parseInt(formData.get('rating')?.toString()??"1");
            const review = await prisma.reviews.findFirst({
                where:{
                    user_id:user.id,
                    product_id:product.id
                }
            })
            if(review){
                await prisma.reviews.update({
                    where:{ id:review.id },
                    data:{
                        rating: reviewRating,
                        review: reviewBody
                    }
                })
            } else {
                await prisma.reviews.create({
                    data:{
                        rating: reviewRating, 
                        review: reviewBody,
                        product_id: product.id,
                        user_id: user.id
                    }
                })
            }
            return Response.json({ status:true }, { status:201 });
        }
        return Response.json({ status:false }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}