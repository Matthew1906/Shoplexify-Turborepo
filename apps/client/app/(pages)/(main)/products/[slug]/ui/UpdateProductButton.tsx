'use client'

import { useState } from "react";
import { productMutationData } from "@repo/interface";
import { TextButton } from "@repo/ui/buttons"
import { ProductModal } from "../../ui";

const UpdateProductButton = ({product}:{product:productMutationData})=>{
    const [ showProductForm, setShowProductForm ] = useState<boolean>(false);
    const openForm = ()=>setShowProductForm(true);
    const closeForm = ()=>setShowProductForm(false);
    return <>
        <div className="flex self-stretch my-2 lg:my-4">
            <TextButton text='Edit Product Information' onClick={openForm} className="flex-grow"/>
            <ProductModal onHideModal={closeForm} product={product} show={showProductForm} />
        </div>
    </>
}

export default UpdateProductButton;