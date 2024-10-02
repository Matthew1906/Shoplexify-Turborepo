'use server'

import { revalidatePath, revalidateTag } from "next/cache";
import { generateHeader } from "@/app/lib/auth";
import { 
    productMutationResponse, productResponse, 
    productsResponse, searchParams 
} from "@repo/interface";

export const createProduct = async(formData: FormData):Promise<productMutationResponse|undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/products`;
        const header = await generateHeader();
        const response = await fetch(url, { 
            method:'POST', 
            headers: header, 
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
        const header = await generateHeader();
        const response = await fetch(url, { 
            method:'PUT', 
            headers: header, 
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
        const header = await generateHeader();
        const formData = new FormData();
        formData.append('stock', stock.toString());
        const response = await fetch(url, { 
            method:'PATCH', 
            headers: header, 
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