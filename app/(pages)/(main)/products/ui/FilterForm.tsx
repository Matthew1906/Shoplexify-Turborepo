'use client'

import AddProductButton from "./AddProductButton"
import { useSession } from "next-auth/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { categories } from "@prisma/client"
import { FormEvent, useRef, useState } from "react"
import { TextButton } from "@/app/components/buttons"
import { roboto_bold, roboto_semibold } from "@/app/lib/font"

const FilterForm = ({categories}:{categories:Array<categories>|undefined})=>{
    // Validate number input
    const [ priceRangeError, setPriceRangeError ] = useState<string|null>(null);
    // Manage path
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement|null>(null);
    // Submit form to change search params, thus altering the displayed products
    const handleSubmit = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        setPriceRangeError(null);
        const formData = new FormData(event.currentTarget);
        const selectedCategories = formData.getAll('categories').join(",");
        // const selectedRatings = formData.getAll('rating').join(",");
        const minPrice = parseInt(formData.get("minPrice")?.toString()??"");
        const maxPrice = parseInt(formData.get("maxPrice")?.toString()??"");
        if(minPrice>maxPrice){
            setPriceRangeError("Min price must be lower than Max price!");
        } else {
            const editableParams = new URLSearchParams(searchParams);
            if(selectedCategories.length>0){
                editableParams.set("categories", selectedCategories);
            } else {
                editableParams.delete("categories");
            }
            if(!Number.isNaN(minPrice)){
                editableParams.set("minPrice", minPrice.toString());
            } else {
                editableParams.delete("minPrice");
            }
            if(!Number.isNaN(maxPrice)){
                editableParams.set("maxPrice", maxPrice.toString());
            } else {
                editableParams.delete("maxPrice");
            }
            // if(selectedRatings.length>0){
            //     editableParams.set("rating", selectedRatings);
            // } else {
            //     editableParams.delete("rating");
            // }
            editableParams.set("page", "1");
            router.replace(`${pathname}?${editableParams.toString()}`);
            router.refresh(); 
        }
    }
    // Reset parameters
    const resetParams = ()=>{
        router.replace(`${pathname}?page=1`);
        formRef?.current?.reset();
    }
    // session
    const session = useSession();
    return (
        <div className="lg:col-span-2 px-1 flex flex-col items-start text-sm xl:text-base">
            { session.status == 'authenticated' && session.data.role == 'admin' && <AddProductButton /> }
            <form onSubmit={handleSubmit} method='GET' ref={formRef}>
                <div className="flex flex-col items-start mb-5">
                    <h3 className={`${roboto_bold.className} text-base lg:text-xl mb-2`}>Categories:</h3>
                    {categories && categories.map((category:categories)=>{
                        return <div className="flex-center gap-2 mb-2" key={category.id}>
                            <input 
                                type="checkbox" 
                                name="categories" value={category.slug}
                                id={category.slug}
                                defaultChecked={(searchParams.get("categories")??"").includes(category.slug)}
                            />
                            <label htmlFor={category.slug} className={`${roboto_semibold.className}`}>{category.name}</label>
                        </div>
                    })}
                </div>
                <div className="mb-5">
                    <h3 className={`${roboto_bold.className} text-base lg:text-xl mb-2`}>Price Range:</h3>
                    {priceRangeError && <p className={`${roboto_semibold.className} text-red mb-2`}>{priceRangeError}</p>}
                    <div className="flex mb-2">
                        <p className={`${roboto_semibold.className} px-2 lg:px-4 py-1 lg:py-2 border-2 border-navy-blue rounded-l-lg`}>Rp.</p>
                        <input 
                            type="number" name="minPrice" id="minPrice" 
                            placeholder="Minimum price"
                            min={0}
                            defaultValue={parseInt(searchParams.get("minPrice")??"0")}
                            className={`${roboto_semibold.className} px-2 lg:px-4 py-1 lg:py-2 border-2 border-l-0 border-navy-blue rounded-r-lg outline-none`}
                        />
                    </div>
                    <div className="flex">
                        <p className={`${roboto_semibold.className} px-2 lg:px-4 py-1 lg:py-2 border-2 border-navy-blue rounded-l-lg`}>Rp.</p>
                        <input 
                            type="number" name="maxPrice" id="maxPrice"
                            placeholder="Maximum price"
                            defaultValue={parseInt(searchParams.get("maxPrice")??"20000000")}
                            min={0}
                            className={`${roboto_semibold.className} px-2 lg:px-4 py-1 lg:py-2 border-2 border-l-0 border-navy-blue rounded-r-lg outline-none`}
                        />
                    </div>
                </div>
                {/* <div className="flex flex-col items-start mb-5">
                    <h3 className={`${roboto_bold.className} text-xl mb-2`}>Rating:</h3>
                    {Array.from({ length: 5 }, (_, i) => 5-i).map((idx:number)=>{
                        return <div className="flex-center gap-2 mb-2" key={idx}>
                            <input 
                                type="checkbox" 
                                name="rating" value={idx}
                                defaultChecked={(searchParams.get("rating")??"").includes(idx.toString())}
                                id={"rating-"+idx.toString()}
                            />
                            <label htmlFor={"rating"+idx.toString()} className={`${roboto_semibold.className} flex`}>
                                {Array.from({ length: idx }, (_, i) => i+1).map((val:number)=>{
                                    return <MdStar key={val} className="text-yellow w-6 h-6"/>
                                })}
                            </label>
                        </div>
                    })}
                </div> */}
                <div className="flex justify-between gap-2 lg:gap-5">
                    <TextButton text="Reset" theme="secondary" onClick={resetParams}/>
                    <TextButton text="Apply" isForm/>
                </div>
            </form>
        </div>
    )
}

export default FilterForm;