'use server'

import { cookies } from "next/headers"
import { authToken } from "@repo/interface"
import { decodeJWT } from "@repo/jwt";

export const generateHeader = async():Promise<Headers>=>{
    const token = cookies().get('jwt');
    const header = new Headers()
    header.set('Authorization', `Bearer ${token?.value}`);
    return header;
}

export const getToken = async():Promise<authToken|null> =>{
    const jwt = cookies().get('jwt');
    if(jwt){
        const token = decodeJWT(jwt.value);
        return token 
    } 
    return null;
}
