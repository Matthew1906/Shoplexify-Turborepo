'use client'

import { useState, useEffect } from "react"

const useScreenSize = ()=>{
    const [screenSize, setScreenSize] = useState<number>(0); 
    const handleResize = ()=>{
        if(window.innerWidth<1280){
            setScreenSize(0); // tablet screen
        }
        else setScreenSize(1); // large desktop screen
    }
    useEffect(()=>{
        handleResize();
        window.addEventListener('resize', handleResize)
        return()=>{
            window.removeEventListener('resize', handleResize)
        }
    }, []);
    return screenSize;
}

export default useScreenSize;