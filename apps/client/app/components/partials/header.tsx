'use client'

import Link from "next/link";
import SearchBar from "./search_bar";
import { signOut } from "next-auth/react";
import { MdFace, MdOutlineInsertChart, MdOutlineWarehouse, MdShoppingCart } from "react-icons/md";
import { IconButton, TextButton } from "../buttons";
import { LogoIcon, MenuIcon } from "../icons";
import { useScreenSize } from "@/app/hooks";

const Header = (
    { isAuth=false, isLoggedIn=true, username, isAdmin=false }:
    { isAuth:boolean, isLoggedIn:boolean, username?:string, isAdmin:boolean }
)=>{
    const screenSize = useScreenSize();
    return <header className="bg-navy-blue py-2 md:py-4 lg:py-8 px-3 md:px-5 lg:px-10 flex flex-col lg:flex-row justify-between items-center">
        <div className={`flex ${!isAuth?"flex-grow justify-around":"justify-start"} flex-col lg:flex-row items-center gap-2 md:gap-4 xl:gap-8`}>
            <LogoIcon className={screenSize==1?"w-40 h-20":"w-32 h-16"}/>
            { !isAuth &&  
                <> { isLoggedIn && isAdmin // admin login 
                  ? <div className="flex lg:flex-grow flex-col md:flex-row items-center gap-1 md:gap-2 px-2 xl:px-0 ">
                        <SearchBar/>
                        <div className="flex items-center gap-2">
                            {/* Dashboard Menu */}
                            <MenuIcon link='/admin' Icon={MdOutlineInsertChart}/>
                            {/* Stocks Menu */}
                            <MenuIcon link='/products' Icon={MdOutlineWarehouse}/>
                        </div>
                        
                    </div>
                  : <div className="flex lg:flex-grow flex-col md:flex-row items-center gap-2 px-2 xl:px-0 ">
                        <SearchBar/>
                        <MenuIcon link='/cart' Icon={MdShoppingCart}/>
                        {/* { isLoggedIn && <MenuIcon link="#" Icon={MdNotifications}/> } */}
                    </div>
                }
                </> // display search bar and icons if not login page
            }
        </div>
        { !isAuth && // display if not login/register page
        <div className="mt-4 lg:mt-0 lg:ml-8 flex justify-between items-center gap-2 lg:gap-5">
            { isLoggedIn
                ? <>
                    <Link href="/profile">
                        <IconButton Icon={MdFace} text={username??"Jane Doe"} theme="primary"/> 
                    </Link>
                    <TextButton text="Logout" theme='secondary' onClick={()=>signOut({callbackUrl:'/'})}/>
                </>
                : <>
                    <Link href="/login">
                        <TextButton text="Login" theme='secondary'/>
                    </Link>
                    <Link href="/register">
                        <TextButton text="Register"/>
                    </Link>
                </>
                // display Register and Login Button
            }
        </div> }
    </header>
}

export default Header;