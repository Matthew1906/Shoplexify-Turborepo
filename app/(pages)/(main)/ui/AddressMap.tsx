'use client'

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { coordinates } from "@/app/lib/interface";

const AddressMap = ({coordinate}:{coordinate?:coordinates})=>{
    return <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY??""}>
        <Map 
            mapId={process.env.GOOGLE_MAPS_MAP_ID}
            className="h-60 w-full"
            center={coordinate??{lat:-6.176518640085772, lng:106.79102171534362}}
            defaultZoom={15}
            zoomControl
            gestureHandling={'greedy'}
            disableDefaultUI={true}
        >
            <AdvancedMarker position={coordinate??{lat:-6.176518640085772, lng:106.79102171534362}}/>
        </Map>
    </APIProvider>
}

export default AddressMap;