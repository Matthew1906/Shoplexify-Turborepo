'use server'

import { revalidatePath, revalidateTag } from "next/cache";
import { generateHeader } from "@/app/lib/auth";
import { orderResponse } from "@repo/interface";

export const createOrder = async(product:string, quantity:number)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const formData = new FormData();
    formData.append("quantity", quantity.toString());
    const header = await generateHeader();
    await fetch(url, { method: "POST", body: formData, headers: header });
    // Revalidate products path so that they display the correct stock
    revalidatePath('/products/' + product);
    // Revalidate cart
    revalidateTag('cart');
}

export const getOrders = async():Promise<Array<orderResponse>|undefined>=>{
    const url = `${process.env.SERVER_URL}/api/cart`;
    //  Tags: order (all changes related to cart quantity or order detail)
    const header = await generateHeader();
    const response = await fetch(url, { method: 'GET', next:{ tags:['cart'] }, headers:header });
    const jsonResponse = await response.json();
    return jsonResponse.data;
}

export const getOrder = async(product:string)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const header = await generateHeader();
    const response = await fetch(url, { method:'GET', next:{ tags:['cart'] }, headers:header });
    const jsonResponse = await response.json();
    return jsonResponse;
}

export const checkoutOrders = async(formData: FormData)=>{
    const url = `${process.env.SERVER_URL}/api/cart`;
    const header = await generateHeader();
    const response = await fetch(url, { 
        method:'PUT', 
        headers: header, 
        body: formData
    });
    const jsonResponse = await response.json();
    revalidateTag('cart');
    revalidateTag('transactions');
    return jsonResponse;
}

export const editOrder = async(product:string, quantity:number)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const formData = new FormData();
    formData.append("quantity", quantity.toString());
    const header = await generateHeader();
    await fetch(url, { method: "PATCH", body: formData, headers: header });
    // Revalidate products path so that they display the correct stock
    revalidatePath('/products/' + product);
    // Revalidate the user's cart
    revalidateTag('cart');
}

export const deleteOrders = async()=>{
    const url = `${process.env.SERVER_URL}/api/cart`;
    const header = await generateHeader();
    await fetch(url, { method: 'DELETE', headers:header });
    revalidateTag("cart");
    revalidateTag("products");
}

export const deleteOrder = async(product:string)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const header = await generateHeader();
    await fetch(url, { method: "DELETE", headers: header });
    // Revalidate products path so that they display the correct stock
    revalidatePath('/products/' + product);
    // Revalidate the user's cart
    revalidateTag('cart');
}