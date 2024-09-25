'use client'

import { useRouter } from "next/navigation";
import { TextButton } from "@/app/components/buttons"
import { deleteOrders } from "@/app/services/orders";

const ClearCartButton = ()=>{
    const router = useRouter();
    const clearCart = ()=>deleteOrders().then(()=>router.refresh())
    return <TextButton text="Clear Cart" onClick={clearCart}/>
}

export default ClearCartButton;