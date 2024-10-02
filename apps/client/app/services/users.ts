'use server'

import { generateHeader } from "@/app/lib/auth";

export const updateProfile = async(formData:FormData)=>{
    try {
        const url = `${process.env.SERVER_URL}/api/users`;
        const header = await generateHeader();
        const response = await fetch(url, {
            method: 'PATCH',
            headers: header,
            body: formData,
        });
        const data = await response.json();
        return data;
    } catch(error) {
        console.log(error);
    }
}