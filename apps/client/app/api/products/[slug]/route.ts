'use server'

import slugify from "slugify";
import { prisma } from "@repo/database"
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { z } from "zod";
import { deleteFile, uploadImage } from "@repo/imagekit";

export async function GET(req:NextRequest, { params }: { params: { slug: string } }){
    try {
        const slug = params.slug;
        const data = await prisma.products.findFirst({
            where:{ slug: slug.toString() },
            select:{ 
                id: true,
                slug:true,
                name:true, 
                description: true,
                price:true,
                stock:true,
                image_url:true,
                product_categories:{
                    select:{
                        categories:{
                            select:{
                                name: true
                            }
                        }
                    }
                },
                transaction_details:{
                    select:{
                        quantity: true 
                    }
                },
                reviews: {
                    select:{
                        rating: true,
                        review: true,
                        users:{
                            select:{
                                name: true
                            }
                        }
                    }
                }
            }
        })
        if(!data){
            return Response.json({ status:false }, { status:404 });
        }
        let quantities = data?.transaction_details.map(detail=>detail.quantity)??[];
        let ratings = data?.reviews.map(review=>review.rating)??[]
        const product = {
            id: data?.id,
            slug:data?.slug,
            name:data?.name, 
            description: data?.description,
            price:data?.price,
            stock:data?.stock,
            image_url:data?.image_url,
            num_sold: quantities.reduce((a,b)=>a+b, 0),
            avg_rating: Math.fround(ratings.reduce((a,b)=>a+b, 0)/ratings.length),
            reviews: data?.reviews.map(review=>({
                user: review.users?.name,
                rating: review.rating,
                review: review.review
            })),
            categories: data?.product_categories.map(category=>{
                return category.categories.name
            })
        }
        return Response.json({ ...product, status:true }, { status:200 });
    } catch (error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}

export async function PUT(req:NextRequest, { params }: { params: { slug: string } }){
    try {
        const sessionData = await getServerSession();
        const formData = await req.formData();
        const slug = params.slug;
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user){
                return Response.json({ status:false, message: "User cant be found!" }, { status:404 });
            } 
            if(user.id!=1){
                return Response.json({ status:false, message: "Only admin can add/update products" }, { status:401 });
            }
            const name = formData.get('name')?.toString();
            const description = formData.get('description')?.toString();
            const price = parseInt(formData.get('price')?.toString()??"-1");
            const stock = parseInt(formData.get('stock')?.toString()??"-1");
            const encodedImage = formData.get('image')?.toString();
            const categories = formData.getAll("category");
            const newSlug = slugify(name??"").toLowerCase();
            const productExist = await prisma.products.findFirst({where:{ slug:slug }});
            if(productExist == null){
                return Response.json({ status:false, message:"Product doesn't exist!" }, { status:404 });
            }
            const parsedData = z.object({
                name: z.string().min(5).max(50),
                description: z.string().min(5),
                price: z.number().min(10000).max(100000000),
            }).safeParse({name, description, price, stock});
            if(parsedData.success){
                const filename = productExist.image_url.replace(process.env.IMAGEKIT_URL+"/shoplexify/", "")
                const deleteImageStatus = await deleteFile(filename);
                if(!deleteImageStatus){
                    return Response.json({ status:false, error:{ image:"Unexpected error occurred, please retry!" } }, { status:500 });
                }
                const { imageId, image } = await uploadImage(encodedImage??"", newSlug, '');
                const updatedProduct = await prisma.products.update({
                    where:{ id:productExist.id },
                    data:{
                        name: parsedData.data.name,
                        description: parsedData.data.description,
                        price: parsedData.data.price,
                        image_url: image,
                        slug: newSlug
                    }
                })
                await prisma.product_categories.deleteMany({
                    where:{ product_id: updatedProduct.id }
                })
                await Promise.all(categories.map(async(category)=>{
                    const categoryFromDB = await prisma.categories.findFirst({
                        where:{slug:category.toString()}
                    })
                    if(categoryFromDB){
                        await prisma.product_categories.create({
                            data:{
                                category_id: categoryFromDB.id,
                                product_id: updatedProduct.id
                            }
                        })
                    }
                }))
                return Response.json({ status:true, slug:updatedProduct.slug }, { status:200 })
            } else if (parsedData.error){
                return Response.json({ status:false, error:parsedData.error.flatten().fieldErrors }, { status:422 });
            }
        }
        return Response.json({ status:false, message:"Not Authorized" }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}

export async function PATCH(req:NextRequest, { params }: { params: { slug: string } }){
    try {
        const sessionData = await getServerSession();
        const formData = await req.formData();
        const slug = params.slug;
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user){
                return Response.json({ status:false, message:"User cant be found!" }, { status:404 });
            } 
            if(user.id!=1){
                return Response.json({ status:false, message:"Only admin can add/update products" }, { status:401 });
            }
            const productExist = await prisma.products.findFirst({where:{ slug:slug }});
            if(productExist == null){
                return Response.json({ status:false, message:"Product doesn't exist!" }, { status:404 });
            }
            const newStock = parseInt(formData.get('stock')?.toString()??"0");
            if(newStock<=0){
                return Response.json({ status:false, message:"Stock can't be zero!" }, { status:422 });
            }
            const updatedProduct = await prisma.products.update({
                where:{ id:productExist.id },
                data:{ stock:newStock }
            });
            return Response.json({ status:true, message:"Product stock has been updated!" }, { status:200 })
            
        }
        return Response.json({ status:false, message:"Not Authorized" }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}
