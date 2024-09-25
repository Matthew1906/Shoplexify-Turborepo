'use server'

import { headers } from "next/headers";
import { 
    productMutationResponse, productResponse, 
    productsResponse, searchParams 
} from "@/app/lib/interface";
import { revalidatePath, revalidateTag } from "next/cache";

export const createProduct = async(formData: FormData):Promise<productMutationResponse|undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/products`;
        const cookieHeader = new Headers();
        const cookies = headers().get("cookie")??"";
        cookieHeader.set("cookie", cookies);
        const response = await fetch(url, { 
            method:'POST', 
            headers:cookieHeader, 
            body: formData
        });
        const jsonResponse = await response.json();
        revalidateTag("products")
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const getProducts = async(searchParams: searchParams|null): Promise<productsResponse|undefined>=>{
    try {
        const editableParams = new URLSearchParams();
        if(searchParams?.query){
            editableParams.set("query", searchParams?.query);
        } 
        if(searchParams?.categories){
            editableParams.set("categories", searchParams?.categories);
        } 
        if(searchParams?.minPrice){
            editableParams.set("minPrice", searchParams?.minPrice.toString());
        } 
        if(searchParams?.maxPrice){
            editableParams.set("maxPrice", searchParams?.maxPrice.toString());
        } 
        // if(searchParams?.rating){
        //     editableParams.set("rating", searchParams?.rating);
        // } 
        if(searchParams?.sortBy){
            editableParams.set("sortBy", searchParams?.sortBy);
        } 
        if(searchParams?.page){
            editableParams.set("page", searchParams?.page.toString()??"1");
        } 
        const url = `${process.env.SERVER_URL}/api/products?${editableParams.toString()}`;
        // Tags: product (all changes to the any products will require a refresh in products page)
        const response = await fetch(url, {method:"GET", next:{ tags:['products'] }});
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error){
        console.log(error)
    }
}

export const getProduct = async(slug:string):Promise<productResponse|undefined> =>{
    try {
        const url = `${process.env.SERVER_URL}/api/products/${slug}`;
        const response = await fetch(url, { method:'GET', next:{ tags:['products'] }}); // use revalidate Path
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const updateProduct = async(slug:string, formData: FormData):Promise<productMutationResponse|undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/products/${slug}`;
        const cookieHeader = new Headers();
        const cookies = headers().get("cookie")??"";
        cookieHeader.set("cookie", cookies);
        const response = await fetch(url, { 
            method:'PUT', 
            headers:cookieHeader, 
            body: formData
        });
        const jsonResponse = await response.json();
        revalidateTag("products")
        revalidatePath("/products/"+jsonResponse.slug)
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const updateProductStock = async(slug:string, stock:number)=>{
    try {
        const url = `${process.env.SERVER_URL}/api/products/${slug}`;
        const cookieHeader = new Headers();
        const cookies = headers().get("cookie")??"";
        cookieHeader.set("cookie", cookies);
        const formData = new FormData();
        formData.append('stock', stock.toString());
        const response = await fetch(url, { 
            method:'PATCH', 
            headers:cookieHeader, 
            body: formData
        });
        const jsonResponse = await response.json();
        revalidateTag("cart");
        revalidateTag("products");
        revalidatePath("/products/"+slug);
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}