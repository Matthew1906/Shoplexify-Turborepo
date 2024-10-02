'use server'

import { revalidateTag } from "next/cache";
import { generateHeader } from "@/app/lib/auth";
import { reviewResponse } from "@repo/interface";

export const createReview = async(formData: FormData)=>{
    try {
        const url = `${process.env.SERVER_URL}/api/reviews`;
        const header = await generateHeader();
        const response = await fetch(url, { 
            method:'POST', 
            headers: header, 
            body: formData
        });
        const jsonResponse = await response.json();
        revalidateTag("products");
        revalidateTag("cart");
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const getReview = async(productSlug:string):Promise<reviewResponse|undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/reviews/${productSlug}`;
        const header = await generateHeader();
        const response = await fetch(url, {method:'GET', headers:header});
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}
