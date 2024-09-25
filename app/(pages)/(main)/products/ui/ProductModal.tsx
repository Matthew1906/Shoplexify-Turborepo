'use client'

import ImageInput from "./ImageInput";
import { useRouter } from "next/navigation";
import { categories } from "@prisma/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { TextButton } from "@/app/components/buttons";
import { useImage } from "@/app/hooks";
import { roboto_regular } from "@/app/lib/font";
import { productMutationData, productMutationResponse } from "@/app/lib/interface";
import { base64String } from "@/app/lib/string";
import { BaseModal } from "@/app/(pages)/(main)/ui";
import { getCategories } from "@/app/services/categories";
import { createProduct, updateProduct } from "@/app/services/products";

const ProductModal = (
    { show, onHideModal, product } : 
    { show:boolean, onHideModal: ()=>void, product?:productMutationData|null }
)=>{
    const [ errorStatus, setErrorStatus ] = useState<productMutationResponse>();
    const [ categories, setCategories ] = useState<Array<categories>|undefined>([])
    const router = useRouter();
    const { image, setImage, getRootProps, getInputProps, imageError } = useImage();
    useEffect(()=>{
        getCategories().then(data=>setCategories(data))
    }, []);
    useEffect(()=>{
        if(product){
            setImage({preview:product.image_url})
        }
    }, [product, setImage]);
    const handleSubmit = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        setErrorStatus(undefined);
        const formData = new FormData(event.currentTarget);
        if(image){
            fetch(image.preview).then(r => {
                r.blob().then(res=>base64String(res).then(res=>{
                    formData.set('image', res);
                    if(product){
                        updateProduct(product.slug, formData).then(res=>{
                            setErrorStatus(res);  
                            if(res?.status){
                                const slug = res.slug;
                                router.push("/products/"+slug);
                                router.refresh();
                                onHideModal();
                            } else {
                                formRef.current?.reset();
                            }
                        })
                    } else {
                        createProduct(formData).then(res=>{
                            setErrorStatus(res);    
                            if(res?.status){
                                const slug = res.slug;
                                router.push("/products/"+slug);
                                router.refresh();
                                onHideModal();
                            } else {
                                formRef.current?.reset();
                            }

                        })
                    }
                }))
            });
        } else {
            setErrorStatus({status:false, error:{image:"Image can't be null!"}});
        }
    }
    const formRef = useRef<HTMLFormElement|null>(null);
    return (
        <BaseModal show={show} onHideModal={onHideModal} className="w-9/12 lg:w-5/12 h-auto text-xs lg:text-base">
            <form onSubmit={handleSubmit} ref={formRef} className={roboto_regular.className} method="POST">
                <h6 className="font-semibold text-lg lg:text-xl mb-5 text-center">{product?"Edit":"Add"} Product Form</h6>
                { !errorStatus?.status && errorStatus?.message && <p className='text-red px-1'>{errorStatus.message}</p>}
                <div className="w-full mb-2">
                    <label htmlFor="name" className='block mb-2 text-sm lg:text-lg'>Name</label>
                    {!errorStatus?.status && errorStatus?.error?.name && 
                        <p className='text-red mb-2'>{errorStatus.error?.name}</p>
                    }
                    <input type="text" name="name" id="name" placeholder="Insert product name" defaultValue={product?.name} className="mb-2 border border-black border-opacity-75 rounded-md w-full px-2 lg:px-4 py-1 lg:py-2"/>
                </div>
                <div className="w-full">
                    <label htmlFor="description" className='block mb-2 text-sm lg:text-lg'>Description</label>
                    { !errorStatus?.status && errorStatus?.error?.description && 
                        <p className='text-red mb-2'>{errorStatus.error?.description}</p>
                    }
                    <textarea 
                        name="description" rows={5}
                        placeholder="Insert product description" 
                        defaultValue={product?.description}
                        className="mb-2 border border-black border-opacity-75 rounded-md w-full px-2 lg:px-4 py-1 lg:py-2"
                    />
                </div>
                <div className="w-full mb-2">
                    <label htmlFor="category" className='block text-sm lg:text-lg'>Categories</label>
                    {!errorStatus?.status && errorStatus?.error?.categories && 
                        <p className='text-red my-2'>{errorStatus.error?.categories}</p>
                    }
                    <select name="category" multiple id="category" className="w-full p-2 outline-none rounded-l-md border-r-2 border-navy-blue">
                        <option className="p-2 rounded-none" key={0} value={""}></option>
                        {categories && categories.map(category=>{
                            return <option className="p-2 rounded-none" key={category.id} value={category.slug} selected={product?.categories?.includes(category.name)}>{category.name}</option>
                        })}
                    </select>
                </div>
                <div className={`w-full mb-4 ${product?"":"lg:grid lg:grid-cols-2"}`}>
                    <div>
                        <label htmlFor="price" className='block mb-2 text-sm lg:text-lg'>Price</label>
                        { !errorStatus?.status && errorStatus?.error?.price && 
                        <p className='text-red mb-2'>{errorStatus.error?.price}</p>
                        }
                        <div className="flex mb-2">
                            <p className='px-4 py-2 border border-navy-blue rounded-l-lg'>Rp.</p>
                            <input 
                                type="number" name="price" id="price" 
                                placeholder="Insert Price"
                                min={0}
                                defaultValue={product?.price}
                                className='px-4 py-2 border border-l-0 border-navy-blue rounded-r-lg outline-none'
                            />
                        </div>
                    </div>
                    { product == null &&
                        <div>
                            <label htmlFor="stock" className='block mb-2 text-sm lg:text-lg'>Stock</label>
                            { !errorStatus?.status && errorStatus?.error?.stock && 
                             <p className='text-red mb-2'>{errorStatus.error?.stock}</p>
                            }
                            <input type="number" name="stock" id="stock" placeholder="Insert product stock" className="border border-black border-opacity-75 rounded-md w-full px-4 py-2"/>
                        </div>
                    }
                </div>
                <div className="w-full mb-4">
                    <label htmlFor="image" className='block mb-2 text-sm lg:text-lg'>Image</label>
                    { !errorStatus?.status && errorStatus?.error?.image && 
                        <p className='text-red mb-2'>{errorStatus.error.image}</p>
                    }
                    <ImageInput image={image} rootProps={getRootProps} inputProps={getInputProps} p="10"/>
                </div>
                <div className="flex justify-end">
                    <TextButton text="Save Product" isForm/>
                </div>
            </form>
            
        </BaseModal>
    )
}

export default ProductModal;