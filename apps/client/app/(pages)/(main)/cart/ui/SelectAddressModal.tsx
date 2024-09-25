'use client'

import { KeyboardEvent, useState } from "react";
import { MdSearch } from "react-icons/md";
import { TextButton } from "@/app/components/buttons";
import { roboto_semibold } from "@/app/lib/font";
import { address, geolocationResponse } from "@/app/lib/interface";
import { BaseModal, AddressMap }from "@/app/(pages)/(main)/ui";

const SelectAddressModal = (
    { show, onHideModal, saveAddress } : 
    { show:boolean, onHideModal: ()=>void, saveAddress: (selectedAddress:address)=>void }
)=>{
    const [ query, setQuery ] = useState<string>("");
    const [ isError, setIsError ] = useState<boolean>(false);
    const [ address, setAddress ] = useState<address>({lat:-6.176518640085772, lng:106.79102171534362, address:"Central Park Mall"})
    const getLocation = (query:string)=>{
        setIsError(false);
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
        fetch(url+query+"&key="+process.env.GOOGLE_MAPS_API_KEY, { method:"GET" }).
            then(res=>res.json().then(
                jsonData=>{
                    const results: Array<any> = jsonData.results;
                    if(results.length>0){
                        const data:geolocationResponse = results[0];
                        setAddress({
                            address:data.formatted_address, 
                            lat:data.geometry.location.lat, 
                            lng: data.geometry.location.lng
                        })
                    } else {
                        setIsError(true);
                    }
                }
            ))
    }
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