'use client'

import { IconType } from "react-icons";
import { roboto_semibold } from "@/app/lib/font";

const IconButton = (
    {theme='primary', text, Icon} : {theme:string, text:string, Icon:IconType}
) => {
    const themeStyle = theme=='secondary'?"border-navy-blue text-navy-blue bg-white":"border-white text-white bg-navy-blue";
    return <button className={`text-xs xl:text-base px-2 lg:px-5 py-1 lg:py-2 border-2 rounded-lg ${themeStyle} flex justify-between items-center gap-2 hover:opacity-80`}>
        <Icon className="w-5 h-5"/>
        <p className={roboto_semibold.className}>{text}</p>
    </button>
}

export default IconButton;