'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TextButton } from "@/app/components/buttons";
import { roboto_regular } from "@/app/lib/font";
import { updateProductStock } from "@/app/services/products";

const StockSection = ({ product, stock}: { product:string, stock:number }) =>{
    const router = useRouter();
    const [ currentStock, setStock ] = useState<number>(stock);
    const [ isChanged, setIsChanged ] = useState<boolean>(false);
    const reduceStock = ()=>{
        if(currentStock>0){
            setStock(currentStock-1);
            if(currentStock!=stock){
                setIsChanged(true)
            } else {
                setIsChanged(false)
            }
        }
    }
    const addStock = ()=>{
        setStock(currentStock+1);
        if(currentStock!=stock){
            setIsChanged(true)
        } else {
            setIsChanged(false)
        }
    }
    const updateStock = ()=>{
        updateProductStock(product, currentStock).then(res=>{
            if(res.status){
                router.refresh();
            }
            if(res.message){
                alert(res.message)
            }
        });   
    };
    return <div className="px-4 py-2 border-navy-blue border-2 rounded-lg text-center text-sm lg:text-lg">
        <p className={`${roboto_regular.className} mb-4`}>Update stock:</p>
        <div className="flex-center gap-5 mb-4">
            <div className="border-navy-blue border-2 rounded-lg p-2 flex-center gap-4" >
                <FaMinus onClick={reduceStock} className="cursor-pointer"/>
                <p>{currentStock}</p>
                <FaPlus onClick={addStock} className="cursor-pointer"/>
            </div>
            <p>Stock: {currentStock} left</p>        
        </div>
        <div className="flex-center gap-2">
            <TextButton text="Update Stock" onClick={updateStock}/>
        </div>
    </div>
}

export default StockSection;