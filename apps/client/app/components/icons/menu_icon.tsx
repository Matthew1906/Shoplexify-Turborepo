'use client'

import Link from "next/link";
import { IconType } from "react-icons"; 

const MenuIcon = (
    {link, Icon}:{link:string, Icon:IconType}
)=>{
    return <Link href={link}>
        <div className="bg-navy-blue text-white border-2 border-white rounded-md md:rounded-xl hover:opacity-80 flex-center p-1 md:p-2">
            <Icon className="w-3 md:w-6 h-3 md:h-6"/>
        </div>
    </Link>     
}

export default MenuIcon;