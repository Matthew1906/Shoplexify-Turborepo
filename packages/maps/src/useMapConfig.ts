import { configDotenv } from "dotenv";
import { useState } from "react";
import { address, geolocationResponse } from "@repo/interface";

configDotenv()

const useMapConfig = ()=>{
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
    return { address, getLocation, isError }
}

export default useMapConfig;