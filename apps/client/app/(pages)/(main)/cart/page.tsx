import { Metadata } from "next";
import { roboto_bold, roboto_regular } from "@/app/lib/font";
import { getOrders } from "@/app/services/orders";
import { orderResponse } from "@repo/interface";
import { CheckoutForm, ClearCartButton, OrderItem } from "./ui";

export const metadata: Metadata = {
    title:"My Cart - Shoplexify"
}

export default async function CartPage(){
    const cartContents: Array<orderResponse>|undefined = await getOrders();
    return <main className={`${roboto_regular.className} py-3 md:py-5 lg:py-10 px-5 md:px-10 lg:px-20 lg:grid lg:grid-cols-8`}>
        <section className="lg:col-span-5">
            <div className="flex grow justify-between items-center gap-5 mb-5">
                <h2 className={`${roboto_bold.className} text-4xl`}>Cart</h2>
                {(cartContents??[]).length>0 && <ClearCartButton />}
            </div>
            {(cartContents??[]).length<=0 && <p className="text-2xl">No items on cart!</p>}
            {cartContents?.map((cartItem:orderResponse)=>{
                return <OrderItem key={cartItem.slug} item={cartItem} />
            })}
        </section>
        { (cartContents??[]).length>0 && <CheckoutForm orders={cartContents}/>}
    </main>
}