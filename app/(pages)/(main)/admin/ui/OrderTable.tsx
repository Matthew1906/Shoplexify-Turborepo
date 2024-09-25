'use client'

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { roboto_semibold } from "@/app/lib/font";
import { adminOrdersResponse, adminTransactions } from "@/app/lib/interface";
import { currencyString, dateString } from "@/app/lib/string";
import { PaginationBar } from "../../ui";

const OrderTable = ({orders}:{orders:adminOrdersResponse | undefined})=>{
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    useEffect(()=>{
        const editableParams = new URLSearchParams(searchParams);
        editableParams.set('page', (orders?.page??"1").toString());
        router.replace(`${pathname}?${editableParams.toString()}`);
    }, []);
    const getTheme = (status:string)=>{
        if(status == 'Unpaid') {
            return 'bg-red'
        } else if (status == 'On Process') {
            return 'bg-yellow'
        } else return 'bg-green'
    }
    return <>
        <h2 className={`font-semibold ${roboto_semibold.className} mb-5 lg:text-xl`}>Recent Orders</h2>
        <div className="overflow-x-scroll">
            <table className="w-full border-2 border-black text-xs lg:text-base mb-2">
                <thead className="border-2 border-black">
                    <tr>
                        <th className="p-2 lg:p-4">Order Id</th> 
                        <th className="p-2 lg:p-4">Customer Name</th>
                        <th className="p-2 lg:p-4">Order Date</th>
                        <th className="p-2 lg:p-4">Total Price</th>
                        <th className="p-2 lg:p-4">Status</th>
                        <th className="p-2 lg:p-4">Action</th>
                    </tr>
                </thead>
                <tbody className={roboto_semibold.className}>
                    {(orders?.data??[]).map((order:adminTransactions)=>{
                        const theme = getTheme(order.status)
                        return <tr key={order.id} className="text-xs">
                            <td className="p-1 lg:p-4 text-center">{order.id}</td>
                            <td className="p-1 lg:p-4 text-center">{order.user}</td>
                            <td className="p-1 lg:p-4 text-center">{dateString(new Date(order.date))}</td>
                            <td className="p-1 lg:p-4 text-center">{currencyString(order.total_price)}</td>
                            <td className="p-1 lg:p-4 text-center">
                                <div className={`p-1 lg:p-2 rounded-lg text-white lg:font-semibold ${theme}`}>{order.status}</div>
                            </td>
                            <td className="p-1 lg:p-4 text-center">
                                <Link href={`/transactions/${order.id}`}>
                                    <button className="p-1 lg:p-2 font-bold rounded-md border-2 border-black hover:opacity-70" type='button'>
                                        <FaEye />
                                    </button>
                                </Link>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
        <PaginationBar total={orders?.length??0} page={orders?.page??1}/>
    </>
}

export default OrderTable;