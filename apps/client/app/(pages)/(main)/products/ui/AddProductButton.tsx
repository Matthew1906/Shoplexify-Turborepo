'use client'

import ProductModal from "./ProductModal";
import { useState } from "react";
import { TextButton } from "@repo/ui/buttons"

const AddProductButton = ()=>{
    const [ showProductForm, setShowProductForm ] = useState<boolean>(false);
    const openForm = ()=>setShowProductForm(true);
    const closeForm = ()=>setShowProductForm(false);
    return <>
        <div className="flex self-stretch my-2 lg:my-4">
            <TextButton text='Add Product' onClick={openForm} className="flex-grow"/>
            <ProductModal onHideModal={closeForm} product={null} show={showProductForm} />
        </div>
    </>
}

export default AddProductButton;