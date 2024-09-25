import express from "express";
import config from "../config";
import { decode } from "next-auth/jwt";

export default async function (req:express.Request, res:express.Response, next:express.NextFunction){
    try {
        const cookie = req.headers.cookie
        const sessionToken = cookie?.substring(cookie.indexOf("session-token=")).replace("session-token=","");
        if (!sessionToken) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = await decode({
            token: sessionToken,
            secret: config.NEXTAUTH_SECRET,
        });
        if(!decoded){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user = { id:decoded.id, role:decoded.role };
        next();
    } catch(error) {
        return res.status(401).json({message:"Unauthorized"});
    }
}