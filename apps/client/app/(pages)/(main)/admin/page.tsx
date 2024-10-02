import { Metadata } from "next";
import { Suspense } from "react";
import { roboto_regular } from "@/app/lib/font";
import { adminMetric, adminOrderMetrics, adminOrdersResponse, adminSearchParams, Product } from "@repo/interface";
import { getMetrics, getOrderMetrics, getTopProducts, getTransactions } from "@/app/services/admin";
import { Chart, Metrics, OrderTable, ProductList } from "./ui";
import { notFound } from "next/navigation";
import { getToken } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title:"Admin Dashboard - Shoplexify"
}

export default async function AdminPage({searchParams}:{searchParams?:adminSearchParams}){
    const token = await getToken();
    if(token?.role != 'admin'){
        return notFound();
    }
    // Orders -> orders table containing all orders and for chart
    const ordersData: Promise<adminOrdersResponse | undefined> = getTransactions(searchParams??null);
    const orderMetricsData: Promise<adminOrderMetrics | undefined> = getOrderMetrics();
    // Top products can change the dropdown for different months in a year -> dropdown will change the search params?
    const topProductsData: Promise<Array<Product> | undefined> = getTopProducts(searchParams??null);
    // Metrics -> get the basic metrics -> for Metric
    const metricsData: Promise<adminMetric | undefined> = getMetrics();
    // Parallel fetching
    const [ orders, orderMetrics, topProducts, metrics ] = await Promise.all([ ordersData, orderMetricsData, topProductsData, metricsData ]);
    return <main className={`${roboto_regular.className} px-5 lg:px-10 py-5`}>
        <Suspense fallback={<p>Loading..</p>}>
            <Metrics metrics={metrics}/>
            <div className="my-5 lg:my-10 lg:grid lg:grid-cols-2 gap-5">
                <Chart metrics={orderMetrics}/>
                <ProductList products={topProducts} />
            </div>
            <OrderTable orders={orders}/>
        </Suspense>
    </main>
}
