'use client'

import { useRouter } from "next/navigation";
import { deleteOrders } from "@/app/services/orders";
import { TextButton } from "@repo/ui/buttons"

const ClearCartButton = ()=>{
    const router = useRouter();
    const clearCart = ()=>deleteOrders().then(()=>router.refresh())
    return <TextButton text="Clear Cart" onClick={clearCart}/>
}

export default ClearCartButton;