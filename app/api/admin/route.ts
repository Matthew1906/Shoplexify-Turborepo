'use server'

import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    try {
        const sessionData = await getServerSession();
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user || user.id!=1){
                return Response.json({ status:false }, { status:404 });
            } 
            // Number of paid orders
            const orderCount = await prisma.transactions.count({where:{payment_status:'Paid'}}); 
            // Numbers of products sold (total quantity)
            const soldProductsCount = await prisma.transaction_details.aggregate({
                _sum:{
                    quantity: true
                },
                where:{
                    transactions:{
                        payment_status: 'Paid',
                        delivery_status: 'Delivered'
                    }
                }
            })
            // Number of users who purchased something
            const customerCount = await prisma.users.count({
                where:{ 
                    transactions: { 
                        some:{ payment_status: 'Paid' }
                    } 
                }
            })
            // Total revenue
            const revenuesData = await prisma.transaction_details.findMany({ 
                where:{
                    transactions:{
                        payment_status: 'Paid',
                        delivery_status: 'Delivered'
                    }
                }, 
                select:{
                    price: true,
                    quantity: true
                }
            })
            const totalRevenue = revenuesData.reduce((a, b)=>{
                return a + (b.price * b.quantity)
            }, 0)
            // Number of reviews
            const reviewCount = await prisma.reviews.count();
            return Response.json({ 
                status: true, 
                orders: orderCount, 
                productsSold:soldProductsCount._sum.quantity,
                revenues: totalRevenue,
                customers: customerCount,
                reviews: reviewCount
            }, { status: 200 })
        }
        return Response.json({ status:false }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 })
    }
}