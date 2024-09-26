import { IconType } from "react-icons";
import { FaCommentDots, FaMoneyBill, FaShoppingBag, FaShoppingCart, FaUserFriends } from "react-icons/fa";
import { roboto_bold } from "@/app/lib/font";
import { adminMetric } from "@repo/interface";
import { popularityString } from "@/app/lib/string";

const MetricItem = (
    {Icon, color, label, value} : 
    {Icon:IconType, color:string, label:string, value:number }
)=>{
    const colorString = `border-${color} text-${color}`; 
    return <div className={`${colorString} h-12 lg:h-20 border-4 text-xs md:text-sm xl:text-lg rounded-lg px-3 lg:px-5 py-1 lg:py-2 ${roboto_bold.className} flex-center gap-5`}>
        <Icon className="w-4 md:w-8 xl:w-14 h-4 md:h-8 xl:h-14" />
        <div className="text-center font-bold">
            <p>{label}</p>
            <p>{popularityString(value)}</p>
        </div>
    </div>
}

const Metrics = ({metrics}:{metrics:adminMetric|undefined})=>{
    return <section id="admin-metric" className="flex flex-wrap justify-center lg:justify-evenly items-center gap-4 lg:gap-10">
        <MetricItem Icon={FaShoppingCart} color="blue" label="Orders" value={metrics?.orders??0}/>
        <MetricItem Icon={FaShoppingBag} color="green" label="Products Sold" value={metrics?.productsSold??0}/>
        <MetricItem Icon={FaUserFriends} color="yellow" label="Customers" value={metrics?.customers??0}/>
        <MetricItem Icon={FaMoneyBill} color="red" label="Revenue" value={metrics?.revenues??0}/>
        <MetricItem Icon={FaCommentDots} color="navy-blue" label="Reviews" value={metrics?.reviews??0}/>
    </section>
}

export default Metrics;