'use server'

import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest){
    const searchParams = req.nextUrl.searchParams;
    try {
        const sessionData = await getServerSession();
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user){
                return Response.json({ status:false, message:"User doesn't exist" }, { status:404 });
            } 
            const page = parseInt(searchParams.get('page')??"1");
            const pageLength:number = parseInt(process.env.PAGE_LENGTH??"5");
            const length = await prisma.transactions.count({
                where: user.id != 1 ? {
                    user_id: user.id
                } : {}
            });
            const transactionData = await prisma.transactions.findMany({
                where: user.id != 1 ? {
                    user_id: user.id
                } : {},
                skip: user.id == 1 ? pageLength * (page-1):0,
                ...(user.id == 1 ? { take:pageLength } : {}),
                select:{
                    id: true,
                    users:{
                        select:{
                            name: true
                        }
                    },
                    date: true,
                    delivery_status: true,
                    delivery_cost: true,
                    payment_status: true,
                    transaction_details:{
                        select:{
                            price: true,
                            quantity: true
                        }
                    }
                },
                orderBy: user.id == 1 ? { date: 'desc' } : {}
            })
            const transactions = transactionData.map(transaction=>{
                return {
                    id: transaction.id,
                    user: transaction.users?.name,
                    date: transaction.date,
                    status: transaction.payment_status == 'Unpaid' 
                        ? 'Unpaid' 
                        : transaction.payment_status == 'Paid' && transaction.delivery_status == 'Unsent' 
                        ? 'On Process' 
                        : 'Delivered',
                    total_price: transaction.delivery_cost + 
                        transaction.transaction_details.reduce((a, b)=>a + b.price * b.quantity, 0)
                }
            })
            return Response.json({ 
                status: true, 
                data: transactions, 
                ...(user.id == 1? { page: page, length: length }:{}) 
            }, { status:200 })
        }
        return Response.json({ status:false }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}