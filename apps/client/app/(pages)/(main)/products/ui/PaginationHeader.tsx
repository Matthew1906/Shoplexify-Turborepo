'use client'

import SortBy from "./SortBy";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const pageLength:number = parseInt(process.env.PAGE_LENGTH??"5");

const PaginationHeader = ({page, total}:{page:number, total:number})=>{
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    useEffect(()=>{
        const editableParams = new URLSearchParams(searchParams);
        editableParams.set('page', page.toString());
        router.replace(`${pathname}?${editableParams.toString()}`);
    }, []);
    return (
        <div className="flex justify-between items-center text-sm md:text-xl gap-2 md:gap-0">
            <h4>Showing {" "}
                <span className="font-bold">
                    {total%10==0||total<10?total:`${total-(total%10)}+`}
                </span>
                {" "} products {" "}
                <span className="font-semibold">
                    ({((page-1)*pageLength)+1}
                </span>
                {" "} - {" "}
                <span className="font-semibold">
                    {page*pageLength<=total?page*pageLength:total}
                </span> 
                {" "} out of {" "} 
                <span className="font-semibold">
                    {total})
                </span>
            </h4>
            <SortBy />
        </div>
    )
}

export default PaginationHeader;