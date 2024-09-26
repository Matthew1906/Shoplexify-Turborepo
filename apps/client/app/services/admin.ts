'use server'

import { headers } from "next/headers";
import { 
    adminMetric, adminOrderMetrics, 
    adminOrdersResponse, adminSearchParams, Product 
} from "@repo/interface";

export const getMetrics = async():Promise<adminMetric|undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/admin`;
        const header = new Headers(headers());
        const response = await fetch(url, { 
            method: 'GET', 
            next: { revalidate: 3600 }, // Time based revalidation every hour
            headers: header
        });
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const getOrderMetrics = async():Promise<adminOrderMetrics|undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/admin/transactions`;
        const header = new Headers(headers());
        const response = await fetch(url, { 
            method:'GET', 
            next: { revalidate: 3600 }, // Time based revalidation every hour
            headers: header, 
        });
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const getTopProducts = async(searchParams: adminSearchParams|null):Promise<Array<Product>|undefined>=>{
    try {
        const editableParams = new URLSearchParams();
        if(searchParams?.month){
            editableParams.set("month", searchParams.month.toString());
        } else {
            editableParams.set("month", new Date().getMonth().toString())
        }
        const header = new Headers(headers());
        const url = `${process.env.SERVER_URL}/api/admin/products?${editableParams.toString()}`;
        const response = await fetch(url, { 
            method:'GET', 
            next: { revalidate: 3600 }, // Time based revalidation every hour
            headers:header, 
        });
        const jsonResponse = await response.json();
        return jsonResponse.topProducts;
    } catch(error) {
        console.log(error);
    }
}

export const getTransactions = async(searchParams: adminSearchParams|null):Promise<adminOrdersResponse | undefined>=>{
    try {
        const editableParams = new URLSearchParams();
        editableParams.set("page", (searchParams?.page??"1").toString());
        const url = `${process.env.SERVER_URL}/api/transactions?${editableParams.toString()}`;
        const header = new Headers(headers());
        const response = await fetch(url, { 
            method:'GET', 
            headers:header, 
            next: { revalidate: 3600 } // Time based revalidation every hour
        });
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error){
        console.log(error);
    }
}