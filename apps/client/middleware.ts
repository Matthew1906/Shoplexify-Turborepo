export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        '/admin',
        '/cart',
        '/profile',
        '/transactions',
        '/transactions/:id*',
    ],
}