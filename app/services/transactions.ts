'use server'

import { headers } from "next/headers";
import { transactionHistoryResponse, transactionResponse } from "@/app/lib/interface";
import { revalidateTag } from "next/cache";

export const getTransactions = async():Promise<Array<transactionResponse> | undefined>=>{
    try {
        const url = `${process.env.SERVER_URL}/api/transactions`;
        const header = new Headers(headers());
        const response = await fetch(url, {method:'GET', headers:header, next:{ tags:['transactions'] }});
        const jsonResponse = await response.json();
        return jsonResponse.data;
    } catch(error){
        console.log(error);
    }
}

export const getTransactionHistory = async (transactionId:number):Promise<transactionHistoryResponse|undefined>=>{
    try{
        const url = `${process.env.SERVER_URL}/api/transactions/${transactionId}`;
        const header = new Headers(headers());
        const response = await fetch(url, {method:'GET', headers:header, next:{ tags:['transactions'] } });
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}

export const updateTransactionStatus = async(transactionId:number)=>{
    try{
        const url = `${process.env.SERVER_URL}/api/transactions/${transactionId}`;
        const header = new Headers(headers());
        const response = await fetch(url, {method:'PATCH', headers:header});
        const jsonResponse = await response.json();
        revalidateTag("transactions")
        revalidateTag("products")
        return jsonResponse;
    } catch(error) {
        console.log(error);
    }
}