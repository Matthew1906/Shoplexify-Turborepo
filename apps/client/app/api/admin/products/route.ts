'use server'

import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { prisma } from "@repo/database"

export async function GET(req:NextRequest){
    const searchParams = req.nextUrl.searchParams;
    try {
        const sessionData = await getServerSession();
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user || user.id!=1){
                return Response.json({ status:false }, { status:401 }); // User not found
            } 
            // Get the 4 most purchased products on a certain month (0-11) 
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth().toString()
            const month = parseInt(searchParams.get("month")?.toString()??currentMonth)
            const startDate = new Date(currentYear, month, 1, 23, 59, 59);
            const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth()+1));
            // Get all transactions
            const details = await prisma.transaction_details.groupBy({
                by:['product_id'], // Group by Product Id and get the sum quantity
                where:{
                    transactions:{
                        date: {
                            gt: startDate,
                            lte: endDate
                        }
                    }
                },
                orderBy:{ _sum:{ quantity:'desc' } },
                take:4
            })
            const topProductIds = details.map((detail)=>detail.product_id);
            const topProducts = await Promise.all(topProductIds.map(async productId=>{
                const product = await prisma.products.findFirst({
                    where:{ id: productId },
                    select:{
                        id: true,
                        slug:true,
                        name:true, 
                        price:true,
                        image_url:true,
                        transaction_details:{
                            select:{
                                quantity: true 
                            }
                        },
                        reviews: {
                            select:{
                                rating: true
                            }
                        }
                    }
                })
                if(!product){
                    return null;
                }
                let quantities = product.transaction_details.map(detail=>detail.quantity);
                let ratings = product.reviews.map(review=>review.rating)
                return {
                    id: product?.id,
                    slug:product?.slug,
                    name:product?.name, 
                    price:product?.price,
                    image_url:product?.image_url,
                    num_sold: quantities?.reduce((a,b)=>a+b, 0),
                    avg_rating: Math.fround(ratings.reduce((a,b)=>a+b, 0)/ratings.length)
                }
            }));
            return Response.json({ status:true, topProducts }, { status:200 }) // Data successfully retrieved
        }
        return Response.json({ status:false }, { status:401 }); // Authorization error
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 }) // Server error
    }
}