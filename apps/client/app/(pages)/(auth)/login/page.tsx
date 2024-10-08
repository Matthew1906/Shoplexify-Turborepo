'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { roboto_bold, roboto_regular, roboto_semibold } from "@/app/lib/font";
import { loginUser } from "@/app/services/auth";
import { authResponse } from "@repo/interface";
import { TextButton } from "@repo/ui/buttons";
  
export default function Login(){
    const [ errorStatus, setErrorStatus ] = useState<authResponse>();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement|null>(null);
    const handleSubmit = async(event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        loginUser(formData).then(data=>{
            setErrorStatus({status:data.status, error:data?.error, message:data?.message});
            if(data.status){    
                router.push('/');
                router.refresh();
            } else {
                formRef?.current?.reset();
            }
        })
    }
    return <main className='p-5 w-full flex justify-center items-start'>
        <form onSubmit={handleSubmit} ref={formRef} className="p-10 bg-white border-1 border-black rounded-lg w-3/4 md:w-1/2 xl:w-1/4 flex-center flex-col gap-2 drop-shadow-md">
            <h3 className={`${roboto_bold.className} text-lg lg:text-2xl`}>Login</h3>
            { !errorStatus?.status && errorStatus?.message &&
                <p className={`${roboto_semibold.className} text-red px-1`}>{errorStatus.message}</p>
            }
            <div className="w-full">
                <label htmlFor="email" className={`block mb-2 ${roboto_semibold.className} text-sm lg:text-lg`}>Email</label>
                <input type="text" name="email" id="email" className="mb-2 border border-black border-opacity-75 rounded-md w-full text-sm lg:text-lg px-2 py-1"/>
                { !errorStatus?.status && errorStatus?.error?.email && 
                  <p className={`${roboto_semibold.className} text-red px-1`}>{errorStatus.error?.email}</p>
                }
            </div>
            <div className="w-full">
                <label htmlFor="password" className={`block mb-2 ${roboto_semibold.className} text-sm lg:text-lg`}>Password</label>
                <input type="password" name="password" id="password" className="mb-2 border border-black border-opacity-75 rounded-md w-full text-sm lg:text-lg px-2 py-1"/>
                { !errorStatus?.status && errorStatus?.error?.password && 
                  <p className={`${roboto_semibold.className} text-red px-1`}>{errorStatus.error?.password}</p>
                }
            </div>
            <p className={`mb-2 text-xs ${roboto_regular.className}`}>Don’t have an account? Click <Link href="/register" className="underline hover:text-red hover:decoration-red">here</Link> to register an account</p>
            <TextButton text="Submit" isForm/>
        </form>
    </main>
}
