'use client'

import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

const ratingDict = [ "Terrible", "Poor", "Average", "Good", "Great"]
const ratingTheme = [ "bg-red", "bg-yellow", "bg-black", "bg-navy-blue", "bg-green"]

const RatingInput = (
    {rating, onChange} :
    {rating:number, onChange:(value:number)=>void}
)=>{
    const [ value, setValue ] = useState<number>(rating);
    const saveRating = (num:number)=>{
        onChange(num);
        setValue(num);
    }
    return <div className="flex items-center gap-3">
        <div className="flex">
        {Array.from({ length: 5 }, (_, i) => i+1).map((val:number)=>{
            if(value>=val){
                return <FaStar 
                    key={val} 
                    className="text-yellow w-6 h-6"
                    onMouseEnter={()=>setValue(val)} 
                    onMouseLeave={()=>setValue(rating)}
                    onClick={()=>saveRating(val)}
                />
            } else {
                return <FaRegStar 
                    key={val} 
                    className="text-yellow w-6 h-6" 
                    onMouseEnter={()=>setValue(val)} 
                    onMouseLeave={()=>setValue(rating)}
                    onClick={()=>saveRating(val)}
                />
            }
        })}
        </div>
        <p className={`p-2 ${ratingTheme[value-1]} text-white text-sm font-semibold rounded-lg`}>
            {ratingDict[value-1]}
        </p>
    </div>
}

export default RatingInput;