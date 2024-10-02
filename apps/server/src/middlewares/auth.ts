import express from "express";
import { decodeJWT, verifyJWT } from "@repo/jwt";

export default async function (req:express.Request, res:express.Response, next:express.NextFunction){
    try {
        const authorization = req.headers.authorization
        if (!authorization) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authorization.split(" ")[1]??"";
        const isVerified = verifyJWT(token);
        if(!isVerified){
            return res.status(401).json({message:"Unauthorized"});
        }
        const decodedToken = decodeJWT(token);
        if(!decodedToken){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user = { id:decodedToken.id.toString(), role:decodedToken.role };
        next();
    } catch(error) {
        return res.status(401).json({message:"Unauthorized"});
    }
}