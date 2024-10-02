'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { MdSearch } from "react-icons/md";
import { roboto_regular } from "@/app/lib/font";
import { getCategories } from "@/app/services/categories";
import { categories } from "@repo/database";

const SearchBar = ()=>{
    const [ categories, setCategories ] = useState<Array<categories>|undefined>([])
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    useEffect(()=>{
        getCategories().then(data=>setCategories(data));
    }, [])
    const handleEnter = (event:KeyboardEvent<HTMLInputElement>)=>{
        if(event.key == 'Enter'){
            formRef.current?.requestSubmit();
        }
    }
    const handleSubmit = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const category = formData.get('category')?.toString()??"";
        const query = formData.get('query')?.toString()??"";
        const params = new URLSearchParams(searchParams);
        if(category!=""){
            params.set("categories", category);
        } else {
            params.delete("categories");
        }
        if(query!=""){
            params.set("query", query);
        } else {
            params.delete('query');
        }
        router.push(`/products?${params}`);
        router.refresh();
    }
    return <form ref={formRef} method='GET' onSubmit={handleSubmit} className={`mb-2 md:mb-0 xl:mx-2 w-full flex justify-center ${roboto_regular.className}`}>
        <select name="category" id="category" defaultValue="" className="text-xs xl:text-base md:p-2 outline-none rounded-l-md border-r-2 border-navy-blue">
            <option className="p-1 md:p-2 rounded-none" key={0} value={""}></option>
            {categories && categories.map(category=>{
                return <option className="p-1 md:p-2 rounded-none" key={category.id} value={category.slug}>{category.name}</option>
            })}
        </select>
        <input 
            type="text" name="query" id="query" 
            className="p-1 md:p-2 flex-grow outline-none text-xs xl:text-base" 
            onKeyDown={handleEnter}
        />
        <button className="bg-white text-navy-blue p-1 md:p-2 rounded-r-md"><MdSearch className="w-2 md:w-5 h-2 md:h-5" /></button>
    </form>
}

export default SearchBar;