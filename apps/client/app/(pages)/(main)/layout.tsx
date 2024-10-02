import { Suspense } from "react";
import { Header } from "@/app/components/partials";
import { getToken } from "@/app/lib/auth";

export default async function RootLayout(
    { children }:
    Readonly<{children: React.ReactNode}>
) {
    const token = await getToken();
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Header isAuth={false} isLoggedIn={token!=null} isAdmin={token?.role == 'admin'} username={token?.name}/>
            {children}
        </Suspense>
    );
}
