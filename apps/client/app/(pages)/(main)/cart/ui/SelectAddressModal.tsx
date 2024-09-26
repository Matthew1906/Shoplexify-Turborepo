'use client'

import { KeyboardEvent, useState } from "react";
import { MdSearch } from "react-icons/md";
import { TextButton } from "@repo/ui/buttons";
import { roboto_semibold } from "@/app/lib/font";
import { AddressMap, useMapConfig } from "@repo/maps";
import { address } from "@repo/interface";
import { BaseModal } from "@repo/ui/utils";

const SelectAddressModal = (
    { show, onHideModal, saveAddress } : 
    { show:boolean, onHideModal: ()=>void, saveAddress: (selectedAddress:address)=>void }
)=>{
    const [ query, setQuery ] = useState<string>("");
    const { isError, getLocation, address } = useMapConfig();
    const searchLocation = ()=>getLocation(query);
    const handleEnter = (event:KeyboardEvent<HTMLInputElement>)=>{
        if(event.key == 'Enter'){
            event.preventDefault();
            getLocation(query);
        }
    }
    return (
        <BaseModal show={show} onHideModal={onHideModal} className="w-9/12 lg:w-5/12 h-auto">
            <h6 className="font-semibold text-lg lg:text-xl mb-5 text-center">Select Address</h6>
            <AddressMap coordinate={address} />
            <div className="flex mt-5 border-2 border-black">
                <input 
                    type="text" name="query" id="query"
                    value={query}
                    onChange={(event)=>setQuery(event.target.value)}
                    className="p-1 lg:p-2 outline-none lg:grow" 
                    onKeyDown={handleEnter}
                />
                <button className="bg-white text-navy-blue lg:p-2 rounded-r-md" onClick={searchLocation}><MdSearch className="w-5 h-5" /></button>
            </div>
            { isError 
            ? <p className={`${roboto_semibold.className} text-red px-1 mt-4`}>Address not found!</p>
            : <p className={`${roboto_semibold.className} text-green px-1 my-4`}>Found Address: {address.address}</p>}
            <div className="flex justify-end">
                <TextButton text="Select Address" onClick={()=>saveAddress(address)}/>
            </div>
        </BaseModal>
    )
}

export default SelectAddressModal;