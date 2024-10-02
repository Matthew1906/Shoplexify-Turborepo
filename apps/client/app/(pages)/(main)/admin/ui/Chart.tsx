'use client'

import { CategoryScale, Chart as ChartConfig, LinearScale, LineElement, PointElement, Title } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useScreenSize } from "@/app/hooks";
import { roboto_semibold } from "@/app/lib/font";
import { adminOrderMetrics } from "@repo/interface";

ChartConfig.register(CategoryScale, LinearScale, PointElement, LineElement, Title);

const Chart = ({metrics}:{metrics:adminOrderMetrics|undefined})=>{
    const screenSize = useScreenSize();
    // console.log('This:'+JSON.stringify(metrics));
    const labels: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const orderCountByMonth = useMemo(()=>{
        return labels.map((val, idx)=>{
            const months = (metrics?.data??[]).map((metric)=>metric.month);
            if (months.includes(idx)){
                const value = (metrics?.data??[]).find((metric)=>metric.month == idx)?.total;
                return value;
            } else {
                return 0;
            }
    })}, []);
    const data = {
        labels: labels,
        datasets: [{
            data: orderCountByMonth,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    }
    return <Line 
        data={data} 
        options={{ 
            // maintainAspectRatio: false, 
            responsive: true, 
            plugins:{
                title:{
                    display:true,
                    font:{
                        size:screenSize==1?25:15,
                    },
                    text:"Number of orders by month",
                    align:"center"
                }
            }
        }}
        className={`max-w-full h-40 lg:h-auto border-2 border-black rounded-lg px-10 py-5 ${roboto_semibold.className}`}
    />
}

export default Chart;