import express from "express";
import { prisma, orders } from "@repo/database";

export const getOrders = async(req:express.Request, res:express.Response)=>{
    try{
        const user = await prisma.users.findFirst({
            where:{id:parseInt(req?.user?.id??"0")}
        })
        if(!user){
            return res.status(404).json({ status:false });
        }
        const orderData = await prisma.orders.findMany({
            where:{
                user_id:user?.id
            },
            select:{
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
        const orders = orderData.map(order=>{
            let quantities = order.products.transaction_details.map(detail=>detail.quantity);
            let ratings = order.products.reviews.map(review=>review.rating)
            return {
                slug:order.products.slug,
                name:order.products.name, 
                price:order.products.price,
                quantity: order.quantity,
                stock: order.products.stock,
                image_url:order.products.image_url,
                num_sold: quantities.reduce((a,b)=>a+b, 0),
                avg_rating: Math.fround(ratings.reduce((a,b)=>a+b, 0)/ratings.length),
                rated_by: ratings.length
            }
        })
        return res.status(200).json({ data: orders })
    } catch(error){
        return res.status(500).json({ status:false, message:error });
    }
}

export const checkoutOrders = async(req:express.Request, res:express.Response)=>{
    try {
        const user = await prisma.users.findFirst({
            where:{id:parseInt(req?.user?.id??"0")}
        })
        if(!user){
            return res.status(404).json({ status:false });
        }
        const formData = await req.body;
        const address = formData.address?.toString();
        const deliveryFee = parseInt(formData.deliveryFee?.toString()??"0");
        const orders = await prisma.orders.findMany({
            where:{ user_id: user.id },
            include:{ products: true }
        });
        if(orders.length<=0){
            return res.status(404).json({ status:false });
        } else {
            const newTransaction = await prisma.transactions.create({
                data:{
                    date: new Date(),
                    address: address??"",
                    delivery_cost: deliveryFee,
                    delivery_status: 'Unsent',
                    payment_method: 'Unknown',
                    payment_status: 'Unpaid',
                    user_id: user.id,
                    transaction_details:{
                        create:orders.map((order)=>({ 
                            quantity:order.quantity,
                            products: { connect:{ id: order.product_id } },
                            price: order.products.price,
                        }))
                    }
                }
            });
            await prisma.orders.deleteMany({
                where:{
                    user_id:user.id
                }
            });
            return res.status(200).json({ status:true, transactionId:newTransaction.id });
        }
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const deleteOrders = async(req:express.Request, res:express.Response)=>{
    try {
        const user = await prisma.users.findFirst({
            where:{id:parseInt(req?.user?.id??"0")}
        })
        if(!user){
            return res.status(404).json({ status:false });
        }
        const orders = await prisma.orders.findMany({
            where:{
                user_id:user?.id
            },
        })
        await Promise.all(
            orders.map(async order=>{
                await prisma.products.update({
                    where:{id:order.product_id},
                    data:{stock:{increment:order.quantity}}
                })
            })
        );
        await prisma.orders.deleteMany({
            where:{
                user_id:user?.id
            }
        })
        return res.status(200).json({ status:true });
    } catch(error) { 
        return res.status(500).json({ status:false, message:error });
    }
}

export const getOrder = async(req:express.Request, res:express.Response)=>{
    try{
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        const product = await prisma.products.findFirst({where:{slug:slug}});
        if(user && product) { // Check if both the user and product exists
            const order = await prisma.orders.findFirst({
                where:{
                    user_id:user.id,
                    product_id:product.id
                }
            })
            if(order){ // Check if the order actually exists (since we are getting the order detail)
                return res.status(200).json({ status:true, quantity:order.quantity });
            } else {
                return res.status(404).json({ status:false });
            }
        }
        return res.status(404).json({ status:false });
    } catch(error) { 
        return res.status(500).json({ status:false, message:error });
    }
}

export const addOrder = async(req:express.Request, res:express.Response)=>{
    try{
        // add order detail
        const formData = req.body;
        const quantity = parseInt(formData.quantity?.toString()??"0");
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        const product = await prisma.products.findFirst({where:{slug:slug}});
        if(user && product && quantity>0) { // Check if user and product exists, and that the inserted quantity is actually > 0
            // the >0 is just extra validation, its actually already validated in the client
            const order = await prisma.orders.findFirst({
                where:{
                    user_id:user.id,
                    product_id:product.id
                }
            })
            if(product.stock>=quantity){ // Check if the product actually have the stock (also validated, but just in case)
                if(order){ // If the order already existed, which it shouldnt, (just in case as well)
                    return res.status(400).json({ status:false });
                } else {
                    // Create an order
                    await prisma.orders.create({
                        data:{ user_id: user.id, product_id: product.id, quantity: quantity }
                    })
                    // Update the product stock
                    await prisma.products.update({
                        where: { slug: slug },
                        data: { stock: { decrement:quantity }}
                    })
                    return res.status(201).json({ status:true });
                }    
            }
            return res.status(500).json({ status:false });
        }
        return res.status(404).json({ status:false });
    } catch (error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const editOrder = async(req:express.Request, res:express.Response)=>{
    try{
        // add order detail
        const formData = req.body;
        const quantity = parseInt(formData.quantity?.toString()??"0");
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        const product = await prisma.products.findFirst({where:{slug:slug}});
        if(user && product) { // The user and product must exist
            const order = await prisma.orders.findFirst({
                where:{
                    user_id:user.id,
                    product_id:product.id
                }
            })
            // Update the product first (restore to previous stock) before changing the stock again
            const updatedProduct = await prisma.products.update({
                where: { slug: slug },
                data: { stock: { increment:order!==null?order?.quantity:0 }}
            })
            if(updatedProduct.stock>=quantity){
                if(quantity<=0){ // Remove the order if its less than 1 (there is actually a delete button as well, but just in case)
                    await prisma.orders.delete({
                        where:{ user_id_product_id: { user_id: user.id, product_id: product.id} },
                    })
                    return res.status(200).json({ status:true });
                }
                if(order){ // the order must exist to be updated
                    await prisma.orders.update({
                        where:{ user_id_product_id: { user_id: user.id, product_id: product.id} },
                        data:{ quantity: quantity }
                    })
                    // as usual, update the stock accordingly
                    await prisma.products.update({
                        where: { slug: slug },
                        data: { stock: { decrement:quantity }}
                    })
                    return res.status(200).json({ status:true });
                } else {
                    return res.status(404).json({ status:false });
                }
            }
        }
        return res.status(404).json({ status:false });
    } catch (error){
        return res.status(500).json({ status:false, message:error });
    }
}

export const deleteOrder = async(req:express.Request, res:express.Response)=>{
    try {  
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        const product = await prisma.products.findFirst({where:{slug:slug}});
        if(user && product) { // The user and product must exist
            const order = await prisma.orders.findFirst({
                where:{
                    user_id:user.id,
                    product_id:product.id
                }
            })
            // Restore the product stock
            await prisma.products.update({
                where: { slug: slug },
                data: { stock: { increment:order!==null?order?.quantity:0 }}
            })
            if(order){ // Remove the product if its less than 1 (there is actually a delete button as well, but just in case)
                await prisma.orders.delete({
                    where:{ user_id_product_id: { user_id: user.id, product_id: product.id} },
                })
                return res.status(200).json({ status:true });
            } 
            return res.status(404).json({ status:false });
        }
        return res.status(404).json({ status:false });
    } catch (error) {
        return res.status(500).json({ status:false, message:error });
    }
}