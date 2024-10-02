import express from "express";
import slugify from "slugify";
import config from "../config";
import { z } from "zod";
import { prisma } from "@repo/database";
import { deleteFile, uploadImage } from "@repo/imagekit";

export const createProduct = async(req:express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message:"User cant be found!" });
        } 
        const name = formData.name;
        const description = formData.description;
        const price = parseInt(formData.price);
        const stock = parseInt(formData.stock);
        const encodedImage = formData.image;
        const categories = formData.category;
        const slug = slugify(name??"").toLowerCase();
        const productExist = await prisma.products.count({where:{ slug:slug }});
        if(productExist>0){
            return res.status(404).json({ status:false, message:"Product already exists!" });
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
                    slug: slug,
                    product_categories:{
                        create:categories.map((category:string)=>(
                            { categories:{ connect:{ slug: category } } }
                        ))
                    }
                }
            })
            return res.status(201).json({ status:true, slug:newProduct.slug })
        } else if (parsedData.error){
            return res.status(422).json({ status:false, error:parsedData.error.flatten().fieldErrors });
        }
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}

// Might need to use next() and pass it as body
export const getProducts = async(req:express.Request, res:express.Response, next:express.NextFunction)=>{
    const searchParams = req.query;
    const isQueryExist = (key:string)=>searchParams[key]??false;
    try{
        const sortBy = searchParams['sortBy']??"";
        const page = parseInt(searchParams['page']?.toString()??"1");
        const pageLength:number = parseInt(config.PAGE_LENGTH??"5");
        const length = await prisma.products.count({
            where:{
                AND:[ 
                    { stock :{ gt:0 } },
                    { OR:[
                        isQueryExist('query') ? 
                            { name: { 
                                contains: searchParams["query"]?.toString()??"", 
                                mode:"insensitive" 
                            } } : {}, 
                        isQueryExist('query') ? 
                            { description: { 
                                contains: searchParams["query"]?.toString()??"", 
                                mode:"insensitive"
                            } } : {}, 
                    ] }, 
                    isQueryExist('categories') ? 
                        { product_categories : { 
                            some: {
                                categories: { 
                                    slug : { in: searchParams["categories"]?.toString()?.split(",")??[] } 
                                }
                            }
                        } } : {},
                    isQueryExist('minPrice') ? 
                        { price: { 
                            gte: parseInt(searchParams['minPrice']?.toString()??"")
                        } } : {}, 
                    isQueryExist('maxPrice') ? 
                        { price: { 
                            lte: parseInt(searchParams['maxPrice']?.toString()??"")
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
                                contains: searchParams["query"]?.toString()??"", 
                                mode:"insensitive" 
                            } } : {}, 
                        isQueryExist('query') ? 
                            { description: { 
                                contains: searchParams["query"]?.toString()??"", 
                                mode:"insensitive"
                            } } : {}, 
                    ] }, 
                    isQueryExist('categories') ? 
                        { product_categories : { 
                            some: {
                                categories: { 
                                    slug : { in: searchParams["categories"]?.toString()?.split(",")??[] } 
                                }
                            }
                        } } : {},
                    isQueryExist('minPrice') ? 
                        { price: { 
                            gte: parseInt(searchParams['minPrice']?.toString()??"")
                        } } : {}, 
                    isQueryExist('maxPrice') ? 
                        { price: { 
                            lte: parseInt(searchParams['maxPrice']?.toString()??"")
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
        return res.status(200).json({
            page:page,
            length:length,
            data:products
        });
    } catch (error) {
        return res.status(500).json({
            page:0,
            length:0,
            data:[],
            message:error
        })
    }    
}

export const getProduct = async(req:express.Request, res:express.Response)=>{
    try {
        const slug = req.params.slug;
        const data = await prisma.products.findFirst({
            where:{ slug: slug?.toString()??"" },
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
            return res.status(404).json({ status:false });
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
        return res.status(200).json({ status:true, ...product })
    } catch (error) {
        return res.status(500).json({ status:false, message:error });
    }
}

export const updateProduct = async(req:express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message: "User cant be found!" });
        } 
        const name = formData.name;
        const description = formData.description;
        const price = parseInt(formData.price);
        const encodedImage = formData.image;
        const categories = formData.category;
        const newSlug = slugify(name??"").toLowerCase();
        const productExist = await prisma.products.findFirst({where:{ slug:slug }});
        if(productExist == null){
            return res.status(404).json({ status:false, message:"Product doesn't exist!" });
        }
        const parsedData = z.object({
            name: z.string().min(5).max(50),
            description: z.string().min(5),
            price: z.number().min(10000).max(100000000),
        }).safeParse({name, description, price});
        if(parsedData.success){
            const filename = productExist.image_url.replace(process.env.IMAGEKIT_URL+"/shoplexify/", "")
            const deleteImageStatus = await deleteFile(filename);
            if(!deleteImageStatus){
                return res.status(500).json({ status:false, error:{ image:"Unexpected error occurred, please retry!" } });
            }
            const { imageId, image } = await uploadImage(encodedImage??"", newSlug, '');
            await prisma.product_categories.deleteMany({
                where:{ product_id: productExist.id }
            })
            const updatedProduct = await prisma.products.update({
                where:{ id:productExist.id },
                data:{
                    name: parsedData.data.name,
                    description: parsedData.data.description,
                    price: parsedData.data.price,
                    image_url: image,
                    slug: newSlug,
                    product_categories:{
                        create:categories.map((category:string)=>(
                            { categories:{ connect:{ slug: category } } }
                        ))
                    }
                }
            })
            return res.status(200).json({ status:true, slug:updatedProduct.slug })
        } else if (parsedData.error){
            return res.status(422).json({ status:false, error:parsedData.error.flatten().fieldErrors });
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json({ status:false, message:error });
    }
}

export const updateProductStock = async(req:express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const slug = req.params.slug;
        const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
        if(!user){
            return res.status(404).json({ status:false, message:"User cant be found!" });
        } 
        const productExist = await prisma.products.findFirst({where:{ slug:slug }});
        if(productExist == null){
            return res.status(404).json({ status:false, message:"Product doesn't exist!" });
        }
        const newStock = parseInt(formData.stock?.toString()??"0");
        if(newStock<=0){
            return res.status(422).json({ status:false, message:"Stock can't be zero!" });
        }
        const updatedProduct = await prisma.products.update({
            where:{ id:productExist.id },
            data:{ stock:newStock }
        });
        return res.status(200).json({ status:true, message:"Product stock has been updated!" })
    } catch(error) {
        return res.status(500).json({ status:false, message:error });
    }
}