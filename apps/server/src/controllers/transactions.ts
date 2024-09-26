import express from "express";
import config from "../config";
import { prisma } from "@repo/database";

export const getTransactions = async(req:express.Request, res:express.Response)=>{
    const searchParams = req.query;
    try {
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message:"User doesn't exist" });
        } 
        const page = parseInt(searchParams['page']?.toString()??"1");
        const pageLength:number = parseInt(config.PAGE_LENGTH??"5");
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
        return res.status(200).json({ 
            status: true, 
            data: transactions, 
            ...(user.id == 1? { page: page, length: length }:{}) 
        })
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const getTransaction = async(req:express.Request, res:express.Response)=>{
    try {
        const id = req.params.id;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message:"User doesn't exist" });
        }
        const transactionHistory = await prisma.transactions.findFirst({ where:{ id:parseInt(id??"0") }});
        if(!transactionHistory){
            return res.status(404).json({ status:false, message:"Transaction doesn't exist" });
        }
        if(user.id!=1 && transactionHistory.user_id!=user.id){
            return res.status(401).json({ status:false });
        }
        const transactionDetails = await prisma.transaction_details.findMany({
            where:{
                transaction_id:transactionHistory.id,
            }, 
            select:{
                price:true,
                quantity: true,
                products:{
                    select:{
                        slug:true,
                        name:true, 
                        price:true,
                        stock:true,
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
                }
            }
        })
        const processedDetails = transactionDetails.map(order=>{
            let quantities = order.products.transaction_details.map(detail=>detail.quantity);
            let ratings = order.products.reviews.map(review=>review.rating)
            return {
                slug:order.products.slug,
                name:order.products.name, 
                price:order.price,
                quantity: order.quantity,
                image_url:order.products.image_url,
                num_sold: quantities.reduce((a,b)=>a+b, 0),
                avg_rating: Math.fround(ratings.reduce((a,b)=>a+b, 0)/ratings.length),
                rated_by: ratings.length
            }
        })
        return res.status(200).json({
            status:true,
            ...transactionHistory,
            transaction_status: transactionHistory.payment_status == 'Unpaid' 
            ? 'Unpaid' 
            : transactionHistory.payment_status == 'Paid' && transactionHistory.delivery_status == 'Unsent' 
            ? 'On Process' 
            : 'Delivered',
            details: processedDetails
        })
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const updateTransactionStatus = async(req:express.Request, res:express.Response)=>{
    try {
        const id = req.params.id;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message:"User doesn't exist" });
        }
        const transactionHistory = await prisma.transactions.findFirst({ where:{ id:parseInt(id??"0") }});
        if(!transactionHistory){
            return res.status(404).json({ status:false, message:"Transaction doesn't exist" });
        }
        await prisma.transactions.update({
            where:{ id:transactionHistory.id },
            data:{
                delivery_status:"Delivered",
                payment_status:"Paid"
            }
        })
        return res.status(200).json({ status:true });
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}