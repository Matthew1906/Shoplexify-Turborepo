'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { MdStar } from "react-icons/md";
import { roboto_light, roboto_semibold } from "@/app/lib/font";
import { Product } from "@repo/interface";
import { currencyString, popularityString, trimString } from "@/app/lib/string";

const MonthFilter = ()=>{
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    useEffect(()=>{
        const editableParams =  new URLSearchParams(searchParams);
        if(!searchParams.get("month")){
            editableParams.set("month", new Date().getMonth().toString());
            router.replace(`${pathname}?${editableParams.toString()}`);
            router.refresh()
        }
    }, [])
    const handleSelect = (event:FormEvent<HTMLSelectElement>)=>{
        event.preventDefault()
        const sortBy = event.currentTarget.value;
        const editableParams =  new URLSearchParams(searchParams);
        editableParams.set("month", sortBy);
        router.replace(`${pathname}?${editableParams.toString()}`);
        router.refresh(); 
    }
    return <select 
        name="month" 
        id="month" 
        onChange={handleSelect} 
        className="py-1 lg:py-2 px-2 lg:px-5 bg-navy-blue rounded-lg text-white text-sm lg:text-base"
        defaultValue={parseInt(searchParams.get("month")??new Date().getMonth().toString())}
    >
        {months.map((val, idx)=>{
            return <option value={idx} key={idx}>{val}</option>
        })}
    </select>
}

const ProductList = ({products}:{products:Array<Product>|undefined})=>{
    return <section id='top-products' className="mt-4 lg:mt-0 border-black border-2 rounded-lg p-5">
        <div className="flex items-center justify-between mb-5">
            <h2 className={`font-semibold ${roboto_semibold.className} lg:text-xl`}>Popular Products</h2>
            <MonthFilter />
        </div>
        <div className="xl:grid xl:grid-cols-2 gap-2">
        {(products??[]).map((product:Product)=>{
            return <Link href={`/products/${product.slug}`} key={product.slug}> 
                <div className="mb-2 lg:mb-0 flex items-start gap-x-5 gap-y-6 text-xs lg:text-base">
                    <Image 
                        src={product.image_url+`?v=${Date.now()}`} 
                        alt={`shoplexify-${product.slug}`} 
                        width={150} 
                        height={150}
                        className="rounded-md opacity-95"
                    /> 
                    <div>
                        <b className={`block mt-2 ${roboto_light.className}`}>{trimString(product.name, 20)}</b>
                        <strong className={`block mb-1 ${roboto_semibold.className}`}>{currencyString(product.price)}</strong>
                        <em className="flex items-center gap-1">
                            <MdStar className="text-yellow w-5 h-5"/>
                            <span>{product.avg_rating??0} | {popularityString(product.num_sold)} sold </span>
                        </em>
                    </div>
                </div>
            </Link>
        })}
        {(!products || products.length <=0) && <p className="col-span-2 text-center font-bold">No Orders!</p>}
        </div>
        
    </section>
}

export default ProductList;