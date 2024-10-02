'use client'

import Image from "next/image";
import Link from "next/link";
import { MdStar } from "react-icons/md";
import { roboto_light, roboto_semibold } from "@/app/lib/font";
import { currencyString, popularityString, trimString } from "@/app/lib/string";
import { Product } from "@repo/interface"

const ProductCard = ({product}:{product:Product})=>{
    return <Link href={`/products/${product.slug}`} prefetch>
        <div className="w-full h-full p-2 md:p-4 shadow-lg shadow-neutral-400 text-sm md:text-base">
            <Image 
                src={product.image_url+`?v=${Date.now()}`} 
                alt={`shoplexify-${product.slug}`} 
                width={200} 
                height={300}
                className="rounded-md opacity-95 w-full h-[60%]"
            />
            <b className={`block mt-2 ${roboto_light.className} text-sm md:text-lg`}>{trimString(product.name, 20)}</b>
            <strong className={`block mb-1 ${roboto_semibold.className}`}>{currencyString(product.price)}</strong>
            <em className="flex items-center gap-1">
                <MdStar className="text-yellow w-6 h-6"/>
                <span>{product.avg_rating??0} | {popularityString(product.num_sold)} sold </span>
            </em>
        </div>
    </Link>
}

export default ProductCard;