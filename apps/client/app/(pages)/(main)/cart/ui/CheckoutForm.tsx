'use client'

import SelectAddressModal from "./SelectAddressModal";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { TextButton } from "@repo/ui/buttons";
import { address, orderResponse } from "@repo/interface";
import { currencyString } from "@/app/lib/string";
import { AddressMap } from "@repo/maps";
import { checkoutOrders } from "@/app/services/orders";

const CheckoutForm = ({orders}:{orders:Array<orderResponse>|undefined})=>{
    const totalPrice = useMemo(()=>{
        const subtotals: Array<number> = (orders??[]).map((order:orderResponse)=>{
            return order.price * order.quantity;
        })
        return subtotals.reduce((total:number, subtotal:number)=>{
            return total+subtotal;
        }, 0)
    }, [orders]);
    const [ address, setAddress ] = useState<address>({lat:-6.176518640085772, lng:106.79102171534362, address:"Central Park Mall"})
    const [ showSelectAddress, setShowSelectAddress ] = useState<boolean>(false);
    const findAddress = ()=>setShowSelectAddress(true);
    const selectAddress = ()=>setShowSelectAddress(false);
    const saveAddress = (selectedAddress:address)=>{
        setAddress(selectedAddress);
        selectAddress();
    }
    const deliveryFee = useMemo(()=>{
        return Math.floor(Math.abs(address.lat) * Math.abs(address.lng) * 25);
    }, [address])
    const router = useRouter();
    const checkout = (event: FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const formData = new FormData();
        formData.set('address', address.address??"");
        formData.set('deliveryFee', deliveryFee.toString());
        checkoutOrders(formData).then((res)=>{
            if(res.status) {
                router.push('/transactions/'+ res.transactionId);
            } else {
                router.refresh();
            }
            
        })
    }
    return <section className="lg:col-span-3 p-2 md:p-4 lg:p-8">
        <form className="border-2 border-navy-blue rounded-lg p-5" onSubmit={checkout}>
            <section>
                <h4 className="text-lg lg:text-2xl font-semibold mb-5">Location</h4>
                <AddressMap coordinate={address}/>
                <p className="my-4 lg:text-xl">Address: <strong>{address.address}</strong></p>
                <div className="flex-center">
                    <TextButton text="Find Address" onClick={findAddress}/>
                </div>
                <SelectAddressModal show={showSelectAddress} onHideModal={selectAddress} saveAddress={saveAddress}/>
            </section>
            <section className="mt-4">
                <h4 className="text-lg lg:text-2xl font-semibold mb-2">Fee</h4>
                <p className="lg:text-xl mb-2"><span>Total Price:</span> <strong>{currencyString(totalPrice)}</strong></p>
                <p className="lg:text-xl mb-2"><span>Delivery Fee:</span> <strong>{currencyString(deliveryFee)}</strong></p>
                <hr className="h-5 border-navy-blue"/>
                <p className="lg:text-xl mb-2"><span>Final Price:</span> <strong>{currencyString(totalPrice + deliveryFee)}</strong></p>
            </section>
            <div className="flex-center mt-5">
                <TextButton text="Checkout" theme="secondary" isForm/>
            </div>
        </form>
    </section>
}

export default CheckoutForm;