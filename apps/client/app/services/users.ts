'use server'

import { headers } from "next/headers";

export const updateProfile = async(formData:FormData)=>{
    try {
        const url = `${process.env.SERVER_URL}/api/users`;
        const cookieHeader = new Headers();
        const cookies = headers().get("cookie")??"";
        cookieHeader.set("cookie", cookies);
        const response = await fetch(url, {
            method: 'PATCH',
            headers: cookieHeader,
            body: formData,
        });
        const data = await response.json();
        return data;
    } catch(error) {
        console.log(error);
    }
}