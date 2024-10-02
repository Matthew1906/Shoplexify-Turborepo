import { categories } from "@prisma/client";
import { Suspense } from "react";
import { productsResponse, searchParams } from "@repo/interface";
import { getCategories } from "@/app/services/categories";
import { getProducts } from "@/app/services/products"
import { FilterForm, Pagination } from "./ui";
import { Metadata } from "next";
import { getToken } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title:"Products - Shoplexify"
}

export default async function Page({searchParams}:{searchParams?:searchParams}){  
    const token = await getToken();
    const categoryData: Promise<Array<categories> | undefined> = getCategories();
    const productsData: Promise<productsResponse | undefined> = getProducts(searchParams??null);
    const [ categories, products ] = await Promise.all([ categoryData, productsData ]);
    return <main className="lg:grid lg:grid-cols-7 gap-5 p-2 md:p-4 lg:p-6 xl:p-10">
        { products && (products?.length??0) > 0 
        ? <>
            <FilterForm categories={categories} isAdmin={token?.role == 'admin'}/>
            <div className="mt-4 lg:mt-0 lg:col-span-5">
                <Suspense fallback={<p key={0}>Loading...</p>}>
                    <Pagination products={products}/>
                </Suspense>
            </div>
        </>
        : <p>No products!</p>
        } 
        
    </main>
}