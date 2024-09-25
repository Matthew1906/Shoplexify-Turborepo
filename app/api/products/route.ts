'use server'

import slugify from "slugify";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadImage } from "@/app/lib/imagekit";

export async function GET(req:NextRequest){
    const searchParams = req.nextUrl.searchParams;
    const isQueryExist = (key:string)=>searchParams.get(key)??false;
    try{
        const sortBy = searchParams.get('sortBy')??"";
        const page = parseInt(searchParams.get('page')??"1");
        const pageLength:number = parseInt(process.env.PAGE_LENGTH??"5");
        const length = await prisma.products.count({
            where:{
                AND:[ 
                    { stock :{ gt:0 } },
                    { OR:[
                        isQueryExist('query') ? 
                            { name: { 
                                contains: searchParams.get("query")??"", 
                                mode:"insensitive" 
                            } } : {}, 
                        isQueryExist('query') ? 
                            { description: { 
                                contains: searchParams.get("query")??"", 
                                mode:"insensitive"
                            } } : {}, 
                    ] }, 
                    isQueryExist('categories') ? 
                        { product_categories : { 
                            some: {
                                categories: { 
                                    slug : { in: searchParams.get("categories")?.split(",")??[] } 
                                }
                            }
                        } } : {},
                    isQueryExist('minPrice') ? 
                        { price: { 
                            gte: parseInt(searchParams.get('minPrice')??"")
                        } } : {}, 
                    isQueryExist('maxPrice') ? 
                        { price: { 
                            lte: parseInt(searchParams.get('maxPrice')??"")
                        } } : {}, 
                ]
            },
        });
        const data = await prisma.products.findMany({
            where:{
                AND:[ 
                    { OR:[
                        isQueryExist('query') ? 
                            { name: { 
                                contains: searchParams.get("query")??"", 
                                mode:"insensitive" 
                            } } : {}, 
                        isQueryExist('query') ? 
                            { description: { 
                                contains: searchParams.get("query")??"", 
                                mode:"insensitive"
                            } } : {}, 
                    ] }, 
                    isQueryExist('categories') ? 
                        { product_categories : { 
                            some: {
                                categories: { 
                                    slug : { in: searchParams.get("categories")?.split(",")??[] } 
                                }
                            }
                        } } : {},
                    isQueryExist('minPrice') ? 
                        { price: { 
                            gte: parseInt(searchParams.get('minPrice')??"")
                        } } : {}, 
                    isQueryExist('maxPrice') ? 
                        { price: { 
                            lte: parseInt(searchParams.get('maxPrice')??"")
                        } } : {}, 
                ]
            },
            skip: pageLength * (page-1),
            take: pageLength,
            orderBy:[
                isQueryExist('sortBy') 
                ? sortBy == 'name-asc'? { name: 'asc'}
                : sortBy == 'name-desc'? { name: 'desc'} 
                : sortBy == 'price-asc'? { price: 'asc'}
                : sortBy == 'price-desc'? { price: 'desc'}   
                : { id :'asc' } : { id:'asc' }, 
            ],
            select:{
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
        });
        const products = data.map(data=>{
            let quantities = data.transaction_details.map(detail=>detail.quantity);
            let ratings = data.reviews.map(review=>review.rating)
            return {
                slug:data.slug,
                name:data.name, 
                price:data.price,
                image_url:data.image_url,
                num_sold: quantities.reduce((a,b)=>a+b, 0),
                avg_rating: Math.fround(ratings.reduce((a,b)=>a+b, 0)/ratings.length)
            }
        })
        // const ratings = searchParams.get('rating')?.split(",").map(rating=>parseInt(rating))??[];
        return NextResponse.json({
            page:page,
            length:length,
            data:products
            // data:isQueryExist('rating') 
            // ? products.filter(product=>ratings.includes(Math.ceil(product.avg_rating)))
            // : products
        }, { status:200 });
    } catch (error) {
        return NextResponse.json({
            page:0,
            length:0,
            data:[],
            message:error
        }, { status:500 })
    }
}

export async function POST(req:NextRequest){
    try {
        const sessionData = await getServerSession();
        const formData = await req.formData();
        if(sessionData?.user?.email){
            const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
            if(!user){
                return Response.json({ status:false, message:"User cant be found!" }, { status:404 });
            } 
            if(user.id!=1){
                return Response.json({ status:false, message:"Only admin can add/update products" }, { status:401 });
            }
            const name = formData.get('name')?.toString();
            const description = formData.get('description')?.toString();
            const price = parseInt(formData.get('price')?.toString()??"-1");
            const stock = parseInt(formData.get('stock')?.toString()??"-1");
            const encodedImage = formData.get('image')?.toString();
            const categories = formData.getAll("category");
            const slug = slugify(name??"").toLowerCase();
            const productExist = await prisma.products.count({where:{ slug:slug }});
            if(productExist>0){
                return Response.json({ status:false, message:"Product already exists!" }, { status:404 });
            }
            const parsedData = z.object({
                name: z.string().min(5).max(50),
                description: z.string().min(5),
                price: z.number().min(10000).max(100000000),
                stock: z.number().min(1).max(1000)
            }).safeParse({name, description, price, stock});
            if(parsedData.success){
                const { imageId, image } = await uploadImage(encodedImage??"", slug, '');
                const newProduct = await prisma.products.create({
                    data:{
                        name: parsedData.data.name,
                        description: parsedData.data.description,
                        price: parsedData.data.price,
                        stock: parsedData.data.stock,
                        image_url: image,
                        slug: slug
                    }
                })
                await Promise.all(categories.map(async(category)=>{
                    const categoryFromDB = await prisma.categories.findFirst({
                        where:{slug:category.toString()}
                    })
                    if(categoryFromDB){
                        await prisma.product_categories.create({
                            data:{
                                category_id: categoryFromDB.id,
                                product_id: newProduct.id
                            }
                        })
                    }
                }))
                return Response.json({ status:true, slug:newProduct.slug }, { status:201 })
            } else if (parsedData.error){
                return Response.json({ status:false, error:parsedData.error.flatten().fieldErrors }, { status:422 });
            }
        }
        return Response.json({ status:false, message:"Not Authorized" }, { status:401 });
    } catch(error) {
        return Response.json({ status:false, message:error }, { status:500 });
    }
}
