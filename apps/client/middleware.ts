import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest){
    const token = cookies().get('jwt');
    if(!token){
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: [
        '/admin',
        '/cart',
        '/profile',
        '/transactions',
        '/transactions/:id*',
    ],
}