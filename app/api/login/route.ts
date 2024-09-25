'use server'

import prisma from '@/app/lib/prisma';
import { z } from 'zod';
import { comparePassword } from '@/app/lib/auth';

export async function POST(req:Request){
    try {
        const formData = await req.formData();
        const email = formData.get("email");
        const password = formData.get("password");
        const parsedCredentials = z.object({ 
            email: z.string().email(), 
            password: z.string().min(5)
        }).safeParse({email, password});
        if(parsedCredentials.success){
            const user = await prisma.users.findFirst({where:{email:parsedCredentials.data.email}});
            if(!user){
                return Response.json({ status:false, message:"Account does not exist!" }, { status:404 });
            }
            const isSamePassword = await comparePassword(password?.toString()??"", user.password);
            if(isSamePassword){
                return Response.json({ status:true, user:user, message:"Login Successful" }, { status:200 });
            } else {
                return Response.json({ status:false, message:"Password doesnt match" }, { status:401 });
            }
        } else if (parsedCredentials.error){
            return Response.json({ status:false, error:parsedCredentials.error.flatten().fieldErrors }, { status:401 });
        }
    } catch (error){
        return Response.json({ status:false, message:error }, { status:500 });
    }
}