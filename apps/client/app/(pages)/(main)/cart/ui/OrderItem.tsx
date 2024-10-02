'use client'

import Image from "next/image";
import { MdStar } from "react-icons/md";
import { roboto_semibold } from "@/app/lib/font";
import { currencyString, popularityString } from "@/app/lib/string";
import { orderResponse } from "@repo/interface";
import { OrderSection } from "../../../../components/ui";

const OrderItem = ({item}:{item:orderResponse})=>{
    return <div className="grid grid-cols-2 md:grid-cols-3 items-start gap-2 mb-5">
         <Image 
            src={item?.image_url+`?v=${Date.now()}`}
            alt={item?.slug}
            width={250}
            height={250}
        />
        <div className="pt-2 pb-4 flex flex-col items-start gap-5">
            <b className={`block mt-2 ${roboto_semibold.className} md:text-lg lg:text-2xl xl:text-3xl`}>{item.name}</b>
            <em className="flex items-center gap-1 text-xs md:text-sm lg:text-xl">
                <span>Sold: {popularityString(item.num_sold)} •  </span>
                <MdStar className="text-yellow w-6 h-6"/>
                <span>{item.avg_rating??0} (rated by {popularityString(item.rated_by??0)}) </span>
            </em>
            <strong className={`block mb-1 text-xs lg:text-2xl ${roboto_semibold.className}`}>{currencyString(item.price)}</strong>
        </div>
        <OrderSection product={item.slug} price={item.price} stock={item.stock??0}/>    
    </div>
}

export default OrderItem;