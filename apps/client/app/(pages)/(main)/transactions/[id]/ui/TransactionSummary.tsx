'use client'

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { TextButton } from "@repo/ui/buttons"
import { transactionHistoryDetails } from "@repo/interface"
import { currencyString } from "@/app/lib/string"
import { AddressMap, useMapConfig } from "@repo/maps"
import { updateTransactionStatus } from "@/app/services/transactions"

const TransactionSummary = (
    {addressString="", deliveryFee=0, details=[], status="", id, isAdmin=false} : 
    {
        addressString?:string, deliveryFee?: number, 
        details?:Array<transactionHistoryDetails>, 
        status?:string, id: number, isAdmin:boolean}
)=>{
    const router = useRouter();
    const totalPrice = useMemo(()=>{
        const subtotals: Array<number> = (details??[]).map((order:transactionHistoryDetails)=>{
            return order.price * order.quantity;
        })
        return subtotals.reduce((total:number, subtotal:number)=>{
            return total+subtotal;
        }, 0)
    }, [details]);
    const { address, getLocation } = useMapConfig();
    useEffect(()=>getLocation(addressString), [addressString]);
    const theme = useMemo(()=>{
        if(status == 'Unpaid') {
            return 'bg-red'
        } else if (status == 'On Process') {
            return 'bg-yellow'
        } else return 'bg-green'
    }, [status]);

    const completeTransaction = ()=>{
        updateTransactionStatus(id).then(res=>{
            if(res.status){
                router.refresh();
            }
        })
    }
    return <section className="col-span-3 p-8">
        <div className="border-2 border-navy-blue rounded-lg p-5">
            <section>
                <h4 className="text-lg lg:text-2xl font-semibold mb-5">Location</h4>
                <AddressMap coordinate={address}/>
                <p className="my-4 lg:text-xl">Address: <strong>{addressString}</strong></p>
            </section>
            <section className="mt-4">
                <h4 className="text-lg lg:text-2xl font-semibold mb-2">Fee</h4>
                <p className="lg:text-xl mb-2"><span>Total Price:</span> <strong>{currencyString(totalPrice)}</strong></p>
                <p className="lg:text-xl mb-2"><span>Delivery Fee:</span> <strong>{currencyString(deliveryFee)}</strong></p>
                <hr className="h-5 border-navy-blue"/>
                <p className="lg:text-xl mb-2"><span>Final Price:</span> <strong>{currencyString(totalPrice + deliveryFee)}</strong></p>
            </section>
            <section className="mt-4 flex items-center gap-3">
                <h4 className="text-lg lg:text-2xl font-semibold">Status: </h4>
                <div className={`p-2 rounded-lg text-white font-semibold ${theme}`}>{status}</div>
            </section>
            <div className="flex-center mt-5 gap-3">
                <TextButton text="Go Back" theme="secondary" onClick={()=>router.back()}/>
                {isAdmin &&  status!=='Delivered' && <TextButton text="Complete Transaction" onClick={completeTransaction}/>}
            </div>
        </div>
    </section>
}

export default TransactionSummary;