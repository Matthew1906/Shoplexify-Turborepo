'use server'

import { prisma } from '@repo/database';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { comparePassword, generatePassword } from '@repo/password-utils';

export async function POST(req:Request){
    try {
        const formData = await req.formData();
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");
        const parsedCredentials = z.object({
            username: z.string().max(255), 
            email: z.string().email(), 
            password: z.string().min(5),
            confirmPassword: z.string().min(5)
        }).safeParse({username, email, password, confirmPassword});
        if(parsedCredentials.success){
            if (parsedCredentials.data.password != parsedCredentials.data.confirmPassword){
                return Response.json({ status:false, error:{ confirmPassword:"Confirm password doesnt match with the password!" } }, { status:422 });
            }
            const userAlreadyExist = await prisma.users.count({where:{email:parsedCredentials.data.email}});
            if(userAlreadyExist>0){
                return Response.json({ status:false, message:"Account already exist!" }, { status:401 });
            }
            const newPassword = await generatePassword(parsedCredentials.data.password);
            await prisma.users.create({
                data:{
                    name: parsedCredentials.data.username,
                    email: parsedCredentials.data.email,
                    password: String(newPassword)
                }
            })
            return Response.json({ status:true }, { status:200 })
        } else if (parsedCredentials.error){
            return Response.json({ status:false, error:parsedCredentials.error.flatten().fieldErrors }, { status:422 });
        }
    } catch (error){
        return Response.json({ status:false, message:error }, { status:500 });
    }
}

export async function PATCH(req:Request){
    try {
        const formData = await req.formData();
        const dob = new Date(formData.get("dob")?.toString()??"");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");
        const parsedCredentials = z.object({
            dob:z.date().optional(),
            password: z.string().optional(),
            confirmPassword: z.string().optional()
        }).refine((data) => {
            const { dob, password, confirmPassword } = data;
            // Condition 1: Only dob is filled
            if (dob && !password && !confirmPassword) return true;
            // Condition 2: Only password and confirmPassword are filled
            if (!dob && password && confirmPassword) return true;
            // Condition 3: All are filled
            if (dob && password && confirmPassword) return true;
            // No valid combination, return false
            return false;
        }).safeParse({dob, password, confirmPassword});
        if(parsedCredentials.success){
            const dobSchema = z.date().min(new Date("1900-01-01"), { message: "Too old" })
                .max(new Date("2014-01-01"), { message: "Too young" });
            const passwordSchema = z.object({password:z.string().min(5), confirmPassword:z.string().min(5)});
            // Revalidate password input
            if(parsedCredentials.data.password){
                const parsedPassword = passwordSchema.safeParse({password, confirmPassword});
                if(!parsedPassword.success){
                    return Response.json({ status:false, error:parsedPassword.error.flatten().fieldErrors }, { status:422 });
                }
            }
            // Revalidate dob input
            if(parsedCredentials.data.dob){
                const parsedDob = dobSchema.safeParse(dob);
                if(!parsedDob.success){
                    return Response.json({ status:false, error:{dob:parsedDob?.error?.errors[0]?.message} }, { status:422 });
                }
            }
            if (parsedCredentials.data.password && parsedCredentials.data.password != parsedCredentials.data.confirmPassword){
                return Response.json({ status:false, error:{confirmPassword:"Confirm password doesnt match with the password!"}}, { status:401 });
            }
            const sessionData = await getServerSession();
            if(sessionData?.user?.email){
                const user = await prisma.users.findFirst({where:{email:sessionData.user.email}});
                if(!user){
                    return Response.json({ status:false, message:"Account doesn't exists!" }, { status:404 })
                }
                if(parsedCredentials.data.password){
                    const isSamePassword = await comparePassword(parsedCredentials.data.password, user.password);
                    if(isSamePassword){
                        return Response.json({ status:false, error:{ password:"This is your old password!" } }, { status:422 });
                    }
                    const newPassword = await generatePassword(parsedCredentials.data.password);
                    if(parsedCredentials.data.dob){
                        await prisma.users.update({
                            where:{id:user.id},
                            data:{
                                dob: parsedCredentials.data.dob,
                                password: String(newPassword),
                            }
                        })
                        return Response.json({ status:true }, { status:200 })
                    } else {
                        await prisma.users.update({
                            where:{id:user.id},
                            data:{
                                password: String(newPassword),
                            }
                        })
                        return Response.json({ status:true }, { status:200 })
                    }
                } else {
                    await prisma.users.update({
                        where:{id:user.id},
                        data:{
                            dob: parsedCredentials.data.dob,
                        }
                    })
                    return Response.json({ status:true }, { status:200 })
                }
                
            }
            return Response.json({ status:false, message:"Account doesn't exists!" }, { status:404 })
        } else if (parsedCredentials.error){
            return Response.json({ status:false, error:parsedCredentials.error.flatten().fieldErrors }, { status:422 });
        }
    } catch (error){
        return Response.json({ status:false, message:error }, { status:500 });
    }
}