'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import { roboto_regular } from "@/app/lib/font";
import { currencyString } from "@/app/lib/string";
import { createOrder, deleteOrder, editOrder, getOrder } from "@/app/services/orders";
import { TextButton } from "@repo/ui/buttons";

const OrderSection = ({ product, stock, price }:{ product:string, stock:number, price:number})=>{
    const router = useRouter();
    const [ isOrdered, setIsOrdered ] = useState<boolean>(false);
    const [ orderQuantity, setOrderQuantity ] = useState<number>(0);
    const [ initialQuantity, setInitialQuantity ] = useState<number>(0);
    const [ isChanged, setIsChanged ] = useState<boolean>(false);
    const reduceOrderQuantity = ()=>{
        if(orderQuantity>0){
            setOrderQuantity(orderQuantity-1);
        }
    }
    const addOrderQuantity = ()=>{
        if(stock+initialQuantity-orderQuantity>0){
            setOrderQuantity(orderQuantity+1);
        }
    }
    useEffect(()=>{
        getOrder(product).then((res)=>{
            if(res.status){
                setInitialQuantity(res.quantity);
                setOrderQuantity(res.quantity);
                setIsOrdered(true);
            } else {
                setInitialQuantity(0);
                setOrderQuantity(0);
            }
        })
    }, [isChanged]);
    const deleteFromCart = ()=>{
        deleteOrder(product).then(()=>{
            setIsChanged(!isChanged);
            router.refresh()
            alert("Product has been removed from cart!");
        });
    }
    const submitCart = ()=>{
        if(isOrdered){
            editOrder(product, orderQuantity).then(()=>{
                setIsChanged(!isChanged);
                router.refresh()
                if(orderQuantity<=0){
                    alert("Product has been removed from cart!");
                }
                else {
                    alert("Product has been edited in cart!");
                }
            })
        }
        else { 
            if (orderQuantity<=0){
                alert("Order quantity can't be zero!");
            }
            else {
                createOrder(product, orderQuantity).then(()=>{
                    setIsChanged(!isChanged);
                    router.refresh()
                    alert("Product has been added to cart!");
                })
            }
        }
    };
    return (stock + orderQuantity)>0 &&
        <div className="col-span-2 md:col-span-1 px-4 py-2 border-navy-blue border-2 rounded-lg text-center text-sm lg:text-lg">
            {!isOrdered && <p className={`${roboto_regular.className} mb-4`}>Set amounts and orders:</p>}
            <div className="flex-center gap-5 mb-4">
                <div className="border-navy-blue border-2 rounded-lg p-2 flex-center gap-4" >
                    <FaMinus onClick={reduceOrderQuantity} className="cursor-pointer"/>
                    <p>{orderQuantity}</p>
                    <FaPlus onClick={addOrderQuantity} className="cursor-pointer"/>
                </div>
                <p>Stock: {stock+initialQuantity-orderQuantity} left</p>   
            </div>
            <p className="mb-4">Subtotal: {currencyString(price*orderQuantity)}</p>
            <div className="flex-center gap-2">
                <TextButton text={isOrdered?"Edit Cart":"Add to Cart"} onClick={submitCart}/>
                {isOrdered && <FaTrashAlt className="w-6 h-6 text-red cursor-pointer" onClick={deleteFromCart}/>}
            </div>
        </div>
}

export default OrderSection;