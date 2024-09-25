import express from "express"

export default async function (req:express.Request, res:express.Response, next:express.NextFunction){
    try {
        if (req?.user?.role !='admin') {
            return res.status(401).json({ message: 'Only admin can access this resource' });
        }
        next();
    } catch(error) {
        return res.status(500).json({message:"Unexpected error occurred!"});
    }
}