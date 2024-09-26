import express from "express";
import { prisma } from "@repo/database";
import { z } from "zod";
import { comparePassword, generatePassword } from "@repo/password-utils";

export const loginUser = async(req:express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const email =  formData.email;
        const password = formData.password;
        const parsedCredentials = z.object({ 
            email: z.string().email(), 
            password: z.string().min(5)
        }).safeParse({email, password});
        if(parsedCredentials.success){
            const user = await prisma.users.findFirst({where:{email:parsedCredentials.data.email}});
            if(!user){
                return res.status(404).json({ status:false, message:"Account does not exist!" });
            }
            const isSamePassword = await comparePassword(password?.toString()??"", user.password);
            if(isSamePassword){
                return res.status(200).json({ status:true, user:user, message:"Login Successful" });
            } else {
                return res.status(401).json({ status:false, message:"Password doesnt match" });
            }
        } else if (parsedCredentials.error){
            return res.status(422).json({ status:false, error:parsedCredentials.error.flatten().fieldErrors });
        }
    } catch (error){
        return res.status(500).json({ status:false, message:error });
    }
}

export const createUser = async(req:express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const username = formData.username;
        const email = formData.email;
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;
        const parsedCredentials = z.object({
            username: z.string().max(255), 
            email: z.string().email(), 
            password: z.string().min(5),
            confirmPassword: z.string().min(5)
        }).safeParse({username, email, password, confirmPassword});
        if(parsedCredentials.success){
            if (parsedCredentials.data.password != parsedCredentials.data.confirmPassword){
                return res.status(422).json({ status:false, error:{ confirmPassword:"Confirm password doesnt match with the password!" } });
            }
            const userAlreadyExist = await prisma.users.count({where:{email:parsedCredentials.data.email}});
            if(userAlreadyExist>0){
                return res.status(401).json({ status:false, message:"Account already exist!" });
            }
            const newPassword = await generatePassword(parsedCredentials.data.password);
            await prisma.users.create({
                data:{
                    name: parsedCredentials.data.username,
                    email: parsedCredentials.data.email,
                    password: String(newPassword)
                }
            })
            return res.status(200).json({ status:true })
        } else if (parsedCredentials.error){
            return res.status(422).json({ status:false, error:parsedCredentials.error.flatten().fieldErrors });
        }
    } catch (error){
        return res.status(500).json({ status:false, message:error });
    }
}

export const updateUser = async(req:express.Request, res:express.Response)=>{
    try {
        const formData = req.body;
        const dob = new Date(formData["dob"]?.toString()??"");
        const password = formData["password"]?.toString()??"";
        const confirmPassword = formData["confirmPassword"]?.toString()??"";
        const parsedCredentials = z.object({
            dob:z.date().optional(),
            password: z.string().optional(),
            confirmPassword: z.string().optional()
        }).refine((data) => {
            const { dob, password, confirmPassword } = data;
            if (dob && !password && !confirmPassword) return true;
            if (!dob && password && confirmPassword) return true;
            if (dob && password && confirmPassword) return true;
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
                    return res.status(422).json({ status:false, error:parsedPassword.error.flatten().fieldErrors });
                }
            }
            // Revalidate dob input
            if(parsedCredentials.data.dob){
                const parsedDob = dobSchema.safeParse(dob);
                if(!parsedDob.success){
                    return res.status(422).json({ status:false, error:{dob:parsedDob?.error?.errors[0]?.message} });
                }
            }
            if (parsedCredentials.data.password && parsedCredentials.data.password != parsedCredentials.data.confirmPassword){
                return res.status(422).json({ status:false, error:{confirmPassword:"Confirm password doesnt match with the password!"}});
            }
            const user = await prisma.users.findFirst({where:{id:parseInt(req?.user?.id??"0")}});
            if(!user){
                return res.status(404).json({ status:false, message:"Account doesn't exists!" })
            }
            if(parsedCredentials.data.password){
                const isSamePassword = await comparePassword(parsedCredentials.data.password, user.password);
                if(isSamePassword){
                    return res.status(422).json({ status:false, error:{ password:"This is your old password!" } });
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
                    return res.status(200).json({ status:true })
                } else {
                    await prisma.users.update({
                        where:{id:user.id},
                        data:{
                            password: String(newPassword),
                        }
                    })
                    return res.status(200).json({ status:true })
                }
            } else {
                await prisma.users.update({
                    where:{id:user.id},
                    data:{
                        dob: parsedCredentials.data.dob,
                    }
                })
                return res.status(200).json({ status:true })
            }
        } else if (parsedCredentials.error){
            return res.status(422).json({ status:false, error:parsedCredentials.error.flatten().fieldErrors });
        }
    } catch (error){
        return res.status(500).json({ status:false, message:error });
    }
}