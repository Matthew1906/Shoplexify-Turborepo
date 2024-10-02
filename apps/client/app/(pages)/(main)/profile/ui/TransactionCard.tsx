'use client'

import Link from "next/link";
import { useMemo } from "react";
import { FaChevronRight } from "react-icons/fa";
import { roboto_bold } from "@/app/lib/font";
import { currencyString, dateString } from "@/app/lib/string";
import { transactionResponse } from "@repo/interface";

const TransactionCard = ({transaction}:{transaction:transactionResponse})=>{
    const theme = useMemo(()=>{
        if(transaction.status == 'Unpaid') {
            return 'bg-red'
        } else if (transaction.status == 'On Process') {
            return 'bg-yellow'
        } else return 'bg-green'
    }, [transaction])
    return <div className="flex justify-between items-center p-5 gap-5 border-2 border-black rounded-md mb-4">
        <div>
            <h2 className={`${roboto_bold.className} text-sm lg:text-xl mb-4`}>
                Order {transaction.id} - {dateString(new Date(transaction.date??""))}
            </h2>
            <div className="flex items-center gap-5 text-sm lg:text-base">
                <p className="text-sm lg:text-xl">
                    <span>Total:</span>
                    <strong>{currencyString(transaction.total_price)}</strong>
                </p>
                <div className={`p-2 rounded-lg text-white font-semibold ${theme}`}>{transaction.status}</div>
            </div>
        </div>
        <Link href={`/transactions/${transaction.id}`}>
            <FaChevronRight className="w-5 h-10" />
        </Link>
    </div>
}

export default TransactionCard;