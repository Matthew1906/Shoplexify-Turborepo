import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToken } from "@/app/lib/auth";
import { roboto_bold, roboto_regular } from "@/app/lib/font";
import { dateString } from "@/app/lib/string";
import { getTransactionHistory } from "@/app/services/transactions";
import { transactionHistoryDetails, transactionHistoryResponse } from "@repo/interface";
import { TransactionItem, TransactionSummary } from "./ui";


export async function generateMetadata(
    {params}:{params:{id:number}}
  ): Promise<Metadata> {
    // read route params
    const id = params.id
      
    return {
      title: `Transaction ${id} - Shoplexify`,
    }
  }

export default async function TransactionHistoryPage({params}:{params:{id:number}}){
    const id = params.id;
    const token = await getToken();
    const transactionHistory: transactionHistoryResponse|undefined = await getTransactionHistory(id);
    if(!transactionHistory?.status){
        return notFound();
    }
    return <main className={`${roboto_regular.className} py-3 md:py-5 lg:py-10 px-5 md:px-10 lg:px-20 lg:grid lg:grid-cols-8`}>
        <section className="lg:col-span-5">
            <div className="flex grow justify-between items-center gap-5 mb-4 lg:mb-8">
                <h2 className={`${roboto_bold.className} text-xl lg:text-4xl`}>
                    Order {transactionHistory?.id} - {dateString(new Date(transactionHistory?.date??""))}
                </h2>
            </div>
            {transactionHistory?.details?.map((cartItem:transactionHistoryDetails)=>{
                return <TransactionItem key={cartItem.slug} item={cartItem} />
            })}
        </section>
        <TransactionSummary 
            details={transactionHistory?.details} 
            deliveryFee={transactionHistory?.delivery_cost} 
            addressString={transactionHistory?.address}
            status={transactionHistory?.transaction_status}
            id={id}
            isAdmin={token?.role=='admin'}
        />
    </main>
}