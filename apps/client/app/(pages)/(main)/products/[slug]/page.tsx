import Image from "next/image";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MdStar } from "react-icons/md";
import { authOptions } from "@/app/lib/auth";
import { roboto_light, roboto_regular, roboto_semibold } from "@/app/lib/font";
import { productResponse, reviewResponse } from "@repo/interface";
import { currencyString, popularityString } from "@/app/lib/string";
import { getProduct } from "@/app/services/products";
import { getReview } from "@/app/services/reviews";
import { ReviewButton, ReviewItem, StockSection, UpdateProductButton } from "./ui";
import { OrderSection } from "../../ui";

export async function generateMetadata(
    {params}:{params:{slug:string}}
  ): Promise<Metadata> {
    // read route params
    const id = params.slug
    const product: productResponse | undefined = await getProduct(id);
    return {
      title: `${product?.name} - Shoplexify`,
    }
  }

export default async function ProductPage( 
    {params}:{params:{slug:string}}
){
    const productData: Promise<productResponse | undefined> = getProduct(params.slug);
    const reviewData: Promise<reviewResponse | undefined> = getReview(params.slug);
    const [ product, review ] = await Promise.all([ productData, reviewData ]);
    const session = await getServerSession(authOptions);
    if(!product?.status){
        return notFound();
    }
    return <main className={`${roboto_regular.className} px-5 lg:px-10 py-2 lg:py-5`}>
        <Suspense fallback={"Loading..."}>
            { product && <>
            <section id="product-info" className="flex flex-col items-center lg:flex-row lg:items-start gap-5">
                <Image 
                    src={product?.image_url+`?v=${Date.now()}`}
                    alt={product?.slug}
                    width={350}
                    height={350}
                    className="w-2/3 h-2/3 lg:w-auto lg:h-auto"
                />
                <div className="pt-2 pb-4 col-span-3 flex flex-col items-start gap-5">
                    <b className={`block mt-2 ${roboto_light.className} text-xl lg:text-3xl`}>{product.name}</b>
                    <div className="flex items-center gap-2 text-xs lg:text-base">
                        {product.categories?.map((category:string)=>{
                            return <div key={category} className="bg-navy-blue px-2 py-1 text-white rounded-lg">{category}</div>
                        })}
                    </div>
                    <em className="flex items-center gap-1 text-sm lg:text-xl">
                        <span>Sold: {popularityString(product.num_sold)} •  </span>
                        <MdStar className="text-yellow w-6 h-6"/>
                        <span>{product.avg_rating??0} (rated by {popularityString(product.reviews?.length??0)}) </span>
                    </em>
                    <strong className={`block mb-1 text-lg lg:text-2xl ${roboto_semibold.className}`}>{currencyString(product.price)}</strong>
                    <p className={`${roboto_regular.className} text-sm lg:text-lg`}>
                        {product.description}
                    </p>
                    {product.stock<=0 && <div className='p-2 rounded-lg text-white font-semibold bg-red'>SOLD OUT</div>}
                </div>
                <div>
                    { session && session.role == 'user' && <OrderSection product={product?.slug} 
                        stock={product?.stock??0} price={product.price}
                    /> }
                    { session?.role == 'admin' && 
                    <>
                        <StockSection product={product.slug} stock={product.stock} />
                        <UpdateProductButton product={{
                            name: product.name,
                            slug: product.slug,
                            description: product.description,
                            image_url: product.image_url,
                            price: product.price,
                            categories: product.categories
                        }} />
                    </> }
                </div>
            </section>
            { ((product.reviews?.length??0) > 0 || (review?.status && review.hasPurchased))  &&
                <section id="product-reviews" className="mt-5 lg:mt-10 border-t-2 border-b-2 border-navy-blue py-5 lg:py-10">
                    <div className="flex items-center gap-5 mb-5">
                        <p className={`${roboto_semibold.className} lg:text-xl`}>Reviews:</p>
                        { session && session.role == 'user' && review?.hasPurchased && <ReviewButton review={review?.review} slug={product?.slug}/> }
                    </div>
                    <div className="px-2 text-lg">
                        {product.reviews?.map((review)=>{
                            return <ReviewItem key={review.user} name={review.user} body={review.review} rating={review.rating} />
                        })}
                    </div>
                </section>
            }
            {/* Recommended products -> TBD */}
            </> }
        </Suspense>
        
    </main>
}
