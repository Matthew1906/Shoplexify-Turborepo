'use client'

import Image from "next/image";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { imageInput } from "@repo/interface";

const ImageInput = (
    { p, image, rootProps, inputProps } : 
    { 
      p:string, image?: imageInput, 
      rootProps: <T extends DropzoneRootProps>(props?: T) => T, 
      inputProps: <T extends DropzoneInputProps>(props?: T) => T
    }
)=>{
    return (
        <div {...rootProps({className: 'dropzone'})} 
            className={`${image?"p-2":`p-${p}`} bg-white border-navy-blue border rounded-lg flex flex-col justify-center items-center`}
        >
            <input {...inputProps()} name="image"/>
            {image 
            ? <Image src={image.preview} alt="product-image" width={200} height={150} className="object-contain opacity-75"/>
            :<>
                <AiOutlineCloudUpload className="w-12 h-12 opacity-75 cursor-pointer"/>
                <p className="opacity-75 text-sm text-center w-32 break-words">
                    Drop image here or click to upload
                </p>
            </>}
        </div>
    );
}

export default ImageInput;