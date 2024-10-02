'use server'

import { categories } from "@repo/database";

export const getCategories = async(): Promise<Array<categories>|undefined>=>{
    try{
        const url = `${process.env.SERVER_URL}/api/categories`
        const response = await fetch(url, { method:"GET" });
        const json = await response.json();
        return json.data;
    } catch(error) {
        console.log(error);
    }
}