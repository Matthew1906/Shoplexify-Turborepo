'use server'

import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { prisma } from "@repo/database"

export async function GET(req:NextRequest, { params }: { params: { slug: string } }){
    try{
        const sessionData = await getServerSession();
        const slug = params.slug;
        if(sessionData?.user?.email){ // Check headers (if logged in)
            const user = await prisma.users.findFirst({where:{email:sessionData?.user?.email}});
            const product = await prisma.products.findFirst({where:{slug:slug}});
            if(user && product) { // Check if both the user and product exists
                const order = await prisma.orders.findFirst({
                    where:{
                        user_id:user.id,
                        product_id:product.id
                    }
                })
                if(order){ // Check if the order actually exists (since we are getting the order detail)
                    return Response.json({ status:true, quantity:order.quantity }, { status:200 });
                } else {
                    return Response.json({ status:false }, { status:404 });
                }
            }
            return Response.json({ status:false }, { status:404 });
        }
        return Response.json({ status:false }, { status:404 });
    } catch(error) { 
        return Response.json({ status:false, message:error }, { status:500 });
    }
}

export async function POST(req:NextRequest, { params }: { params: { slug: string } }){
    try{
        // add order detail
        const formData = await req.formData();
        const quantity = parseInt(formData.get('quantity')?.toString()??"0");
        const slug = params.slug
        const sessionData = await getServerSession();
        if(sessionData?.user?.email){ // Check if logged in
            const user = await prisma.users.findFirst({where:{email:sessionData?.user?.email}});
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
                        return Response.json({status:false});
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
                        return Response.json({ status:true }, { status:201 });
                    }    
                }
                return Response.json({ status:false }, { status:500 });
            }
            return Response.json({ status:false }, { status:404 });
        }
        return Response.json({ status:false }, { status:401 });
    } catch (error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}


export async function PATCH(req:NextRequest, { params }: { params: { slug: string } }){
    try{
        // add order detail
        const formData = await req.formData();
        const quantity = parseInt(formData.get('quantity')?.toString()??"0");
        const slug = params.slug;
        const sessionData = await getServerSession();
        if(sessionData?.user?.email){ // Must have the correct header
            const user = await prisma.users.findFirst({where:{email:sessionData?.user?.email}});
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
                        return Response.json({ status:true }, { status:200 });
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
                        return Response.json({ status:true }, { status:200 });
                    } else {
                        return Response.json({ status:false }, { status:404 });
                    }
                }
            }
            return Response.json({ status:false }, { status:404 });
        }
        return Response.json({ status:false }, { status:401 });
    } catch (error){
        return Response.json({ status:false, message:error }, { status:500 });
    }
}

export async function DELETE(req:NextRequest, { params }: { params: { slug: string } }){
    try {  
        const slug = params.slug;
        const sessionData = await getServerSession();
        if(sessionData?.user?.email){ // Must have the correct header
            const user = await prisma.users.findFirst({where:{email:sessionData?.user?.email}});
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
                    return Response.json({ status:true }, { status:200 });
                } 
                return Response.json({ status:false }, { status:404 });
            }
            return Response.json({ status:false }, { status:404 });
        }
        return Response.json({ status:false }, { status:401 });
    } catch (error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}