import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv"
import { authToken } from "@repo/interface";

configDotenv()

export const signJWT = (email:string, name:string, id:number, dob:Date|null)=>{
    const token = jwt.sign({
        id: id,
        email: email,
        name: name,
        role: id == 1 ? 'admin' : 'user',
        dob: dob
    }, process.env.AUTH_SECRET!, { expiresIn:'1h'});
    return token;
}

export const decodeJWT = (token:string):authToken|null=>{
    const decodeJWT = jwt.decode(token, { json:true });
    if(decodeJWT){
        return {
            id: decodeJWT.id,
            email: decodeJWT.email,
            name: decodeJWT.name,
            role: decodeJWT.role, 
            dob: decodeJWT.dob
        };
    }
    return null;
}

export const verifyJWT = (token:string):boolean=>{
    try {  
        const isVerified = jwt.verify(token, process.env.AUTH_SECRET!)
        if(isVerified){
            return true;
        }
        return false;
    } catch(error) {
        return false;
    }
}