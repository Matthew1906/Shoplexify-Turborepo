import Image from "next/image";
import { MdStar } from "react-icons/md";
import { roboto_semibold } from "@/app/lib/font";
import { transactionHistoryDetails } from "@/app/lib/interface";
import { currencyString, popularityString } from "@/app/lib/string";

const TransactionItem = ({item}:{item:transactionHistoryDetails})=>{
    return <div className="grid grid-cols-2 lg:grid-cols-3 items-start gap-2 mb-5">
         <Image 
            src={item?.image_url+`?v=${Date.now()}`}
            alt={item?.slug}
            width={250}
            height={250}
        />
        <div className="pt-2 pb-4 flex flex-col items-start gap-5">
            <b className={`block mt-2 ${roboto_semibold.className} text-lg lg:text-3xl`}>{item.name}</b>
            <em className="flex items-center gap-1 text-xs lg:text-xl">
                <span>Sold: {popularityString(item.num_sold)} •  </span>
                <MdStar className="text-yellow w-6 h-6"/>
                <span>{item.avg_rating??0} (rated by {popularityString(item.rated_by??0)}) </span>
            </em>
            <strong className={`block mb-1 lg:text-2xl ${roboto_semibold.className}`}>{currencyString(item.price)}</strong>
        </div>
        <div className="col-span-2 lg:col-span-1 px-4 py-2 border-navy-blue border-2 rounded-lg text-sm lg:text-lg">
            <p className="mb-4">Orders: <span className="font-bold">{item.quantity}</span></p>        
            <p>Subtotal: <span className="font-bold">{currencyString(item.price*item.quantity)}</span></p>
        </div>
    </div>
}

export default TransactionItem;