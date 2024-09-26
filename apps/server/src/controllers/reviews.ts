import express from "express";
import { prisma } from "@repo/database";

export const getReviews = async(req:express.Request, res:express.Response)=>{
    try {
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false });
        } 
        const product = await prisma.products.findFirst({where:{slug:slug}});
        if(!product){
            return res.status(404).json({ status:false });
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
        return res.status(200).json({ review, hasPurchased, status:true })
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const createEditReview = async(req: express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message:"User doesn't exist" });
        } 
        const productSlug = formData.slug?.toString();
        const product = await prisma.products.findFirst({ where:{ slug:productSlug } });
        if(!product){
            return res.status(404).json({ status:false, message: "Product doesn't exist" });
        }
        const reviewBody = formData.body?.toString()??"";
        const reviewRating = parseInt(formData.rating?.toString()??"1");
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
        return res.status(201).json({ status:true });
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}