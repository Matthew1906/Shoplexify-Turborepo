import crypto from "crypto";
import config from "../config";

export const comparePassword = async(password: string, encryptedPassword:string): Promise<boolean> => {
    const hashedSplit = encryptedPassword.split("$");
    if(!hashedSplit || (hashedSplit??[]).length < 3){
        return false;
    }
    const methodSplit = hashedSplit[0]?.split(":");
    if (!methodSplit || (methodSplit??[]).length < 3){
        return false;
    }
    const digest = methodSplit[1];
    const iterations = parseInt(methodSplit[2]??"260000"); 
    const salt = hashedSplit[1];
    const keyLength = ((hashedSplit[2]??"").length)/2;
    return new Promise((resolve, reject)=>{
        crypto.pbkdf2(password, salt??"", iterations, keyLength, digest??"", (err, derivedKey)=>{
            if (err) reject(err);
            const hashedPassword = derivedKey.toString('hex');
            resolve(hashedSplit[2]==hashedPassword);
        })
    })
}

export const generatePassword = async(password: string): Promise<String> =>{
    return new Promise((resolve, reject)=>{
        const salt = crypto.randomBytes(13).toString('hex').substring(0, 13);
        const iterations:string = config.HASH_ITERATIONS??"0";
        const digest:string = config.HASH_DIGEST??"sha512";
        crypto.pbkdf2(password, salt, parseInt(iterations), 32, digest, (err, derivedKey)=>{
            if (err) reject(err);
            const hashedPassword = derivedKey.toString('hex');
            resolve(`pbkdf2:sha256:260000\$${salt}\$${hashedPassword}`);
        })
    })
}