'use client'

import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { Header } from "@/app/components/partials";

export default function RootLayout(
    { children }:
    Readonly<{children: React.ReactNode}>
) {
    const session = useSession();
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Header isAuth={false} isLoggedIn={session.status=='authenticated'} isAdmin={session.data?.role=='admin'} username={session.data?.name}/>
            {children}
        </Suspense>
    );
}
