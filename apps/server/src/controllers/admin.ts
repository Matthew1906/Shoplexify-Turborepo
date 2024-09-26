import express from "express";
import { prisma } from "@repo/database";

export const getMetrics = async(req:express.Request, res:express.Response)=>{
    try {
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user || user.id!=1){
            return res.status(404).json({ status:false });
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
        return res.status(200).json({ 
            status: true, 
            orders: orderCount, 
            productsSold:soldProductsCount._sum.quantity,
            revenues: totalRevenue,
            customers: customerCount,
            reviews: reviewCount
        });
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const getOrderMetrics = async(req:express.Request, res:express.Response)=>{
    try {
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user || user.id!=1){
            return res.status(404).json({ status:false });
        } 
        const orderMetrics = await prisma.$queryRaw`
            SELECT DATE_PART('month', date) AS month, CAST(COUNT(*) AS int) AS total
            FROM transactions GROUP BY month`
        return res.status(200).json({ status: true, data: orderMetrics })
    } catch (error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const getTopProducts = async(req:express.Request, res:express.Response)=>{
    const searchParams = req.query;
    try {
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user || user.id!=1){
            return res.status(401).json({ status:false }); // User not found
        } 
        // Get the 4 most purchased products on a certain month (0-11) 
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth().toString()
        const month = parseInt(searchParams["month"]?.toString()??currentMonth)
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
        return res.status(200).json({ status:true, topProducts }) // Data successfully retrieved
    } catch(error) {
        return res.status(500).json({ status:false, message:error }) // Server error
    }
}