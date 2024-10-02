'use server'

import { cookies } from "next/headers";

export const loginUser = async(formData:FormData)=>{
    try {
        const url = `${process.env.SERVER_URL}/api/login`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        const token = data.token;
        cookies().set('jwt', token, { secure:true, maxAge:3600 });
        return data;
    } catch(error){
        console.log(error);
    }
}

export const signOut = async()=>{
    cookies().delete('jwt');
}