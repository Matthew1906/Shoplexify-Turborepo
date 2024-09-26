'use server'

import { headers } from "next/headers";
import { orderResponse } from "@repo/interface";
import { revalidatePath, revalidateTag } from "next/cache";

export const createOrder = async(product:string, quantity:number)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const formData = new FormData();
    formData.append("quantity", quantity.toString());
    const cookieHeader = new Headers();
    const cookies = headers().get("cookie")??"";
    cookieHeader.set("cookie", cookies);
    await fetch(url, { method: "POST", body: formData, headers: cookieHeader });
    // Revalidate products path so that they display the correct stock
    revalidatePath('/products/' + product);
    // Revalidate cart
    revalidateTag('cart');
}

export const getOrders = async():Promise<Array<orderResponse>|undefined>=>{
    const url = `${process.env.SERVER_URL}/api/cart`;
    //  Tags: order (all changes related to cart quantity or order detail)
    const header = new Headers(headers());
    const response = await fetch(url, { method: 'GET', next:{ tags:['cart'] }, headers:header });
    const jsonResponse = await response.json();
    return jsonResponse.data;
}

export const getOrder = async(product:string)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const header = new Headers(headers());
    const response = await fetch(url, { method:'GET', next:{ tags:['cart'] }, headers:header });
    const jsonResponse = await response.json();
    return jsonResponse;
}

export const checkoutOrders = async(formData: FormData)=>{
    const url = `${process.env.SERVER_URL}/api/cart`;
    const cookieHeader = new Headers();
    const cookies = headers().get("cookie")??"";
    cookieHeader.set("cookie", cookies);
    const response = await fetch(url, { 
        method:'PUT', 
        headers:cookieHeader, 
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
    const cookieHeader = new Headers();
    const cookies = headers().get("cookie")??"";
    cookieHeader.set("cookie", cookies);
    await fetch(url, { method: "PATCH", body: formData, headers: cookieHeader });
    // Revalidate products path so that they display the correct stock
    revalidatePath('/products/' + product);
    // Revalidate the user's cart
    revalidateTag('cart');
}

export const deleteOrders = async()=>{
    const url = `${process.env.SERVER_URL}/api/cart`;
    const header = new Headers(headers());
    await fetch(url, { method: 'DELETE', headers:header });
    revalidateTag("cart");
    revalidateTag("products");
}

export const deleteOrder = async(product:string)=>{
    const url = `${process.env.SERVER_URL}/api/cart/${product}`;
    const cookieHeader = new Headers();
    const cookies = headers().get("cookie")??"";
    cookieHeader.set("cookie", cookies);
    await fetch(url, { method: "DELETE", headers: cookieHeader });
    // Revalidate products path so that they display the correct stock
    revalidatePath('/products/' + product);
    // Revalidate the user's cart
    revalidateTag('cart');
}