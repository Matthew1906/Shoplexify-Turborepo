'use client'

import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useRef, useState } from "react"
import { roboto_semibold } from "@/app/lib/font"
import { updateProfile } from "@/app/services/users"
import { profileResponse } from "@repo/interface"
import { TextButton } from "@repo/ui/buttons"

const ProfileForm = ({dob}:{dob:Date|null}) =>{
    const router = useRouter();
    const [ errorStatus, setErrorStatus ] = useState<profileResponse>();
    const formRef = useRef<HTMLFormElement|null>(null);
    const handleSubmit = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        updateProfile(formData).then(data=>{
            console.log(data);
            setErrorStatus({status:data.status, error:data?.error, message:data?.message});
            if(data.status){
                alert("Profile updated! Log in again to view the changes!");
                router.refresh();
            } else {
                formRef?.current?.reset();
            }
        })
    }
    const dateString = useMemo(()=>{
        const date = new Date(dob??"")
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so +1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [dob])
    return <form onSubmit={handleSubmit} ref={formRef} className="p-10">
        <div className="w-full mb-2">
            <label htmlFor="dob" className={`block mb-2 ${roboto_semibold.className} text-sm lg:text-lg`}>Date of Birth</label>
            <input 
                type="date" name="dob" id="dob" defaultValue={dateString}
                className="mb-2 border border-black border-opacity-75 rounded-md w-full text-sm lg:text-lg px-2 py-1"
            />
            { !errorStatus?.status && errorStatus?.error?.dob && 
                <p className={`${roboto_semibold.className} text-red px-1`}>{errorStatus.error?.dob}</p>
            }
        </div>
        <div className="w-full mb-2">
            <label htmlFor="password" className={`block mb-2 ${roboto_semibold.className} text-sm lg:text-lg`}>Password</label>
            <input type="password" name="password" id="password" className="mb-2 border border-black border-opacity-75 rounded-md w-full text-sm lg:text-lg px-2 py-1"/>
            { !errorStatus?.status && errorStatus?.error?.password && 
                <p className={`${roboto_semibold.className} text-red px-1`}>{errorStatus.error?.password}</p>
            }
        </div>
        <div className="w-full mb-2">
            <label htmlFor="confirmPassword" className={`block mb-2 ${roboto_semibold.className} text-sm lg:text-lg`}>Confirm Password</label>
            <input type="password" name="confirmPassword" id="confirmPassword" className="mb-2 border border-black border-opacity-75 rounded-md w-full text-sm lg:text-lg px-2 py-1"/>
            { !errorStatus?.status && errorStatus?.error?.confirmPassword && 
                <p className={`${roboto_semibold.className} text-red px-1`}>{errorStatus.error?.confirmPassword}</p>
            }
        </div>
        <div className="flex items-center justify-end mt-5">
            <TextButton text="Save" isForm/>
        </div>
    </form>
}

export default ProfileForm;