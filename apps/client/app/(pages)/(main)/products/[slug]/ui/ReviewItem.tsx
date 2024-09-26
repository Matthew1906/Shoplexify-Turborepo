'use client'

import { roboto_semibold } from "@/app/lib/font"
import { MdStar } from "react-icons/md"

const ReviewItem = ({name, rating, body}:{name:string, rating:number, body:string})=>{
    return <div className="flex flex-col items-start justify-center gap-2 text-xs mb-4 lg:text-base">
        <div className="flex gap-2">
            <p className={`${roboto_semibold.className}`}>{name}</p>
            <div className="flex">
                {Array.from({ length: rating }, (_, i) => i+1).map((val:number)=>{
                    return <MdStar key={val} className="text-yellow w-6 h-6"/>
                })}
            </div>
        </div>
        <p>&quot;{body}&quot;</p>
    </div>
}

export default ReviewItem;