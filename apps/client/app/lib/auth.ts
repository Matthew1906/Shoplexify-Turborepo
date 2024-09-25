import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions:NextAuthOptions = {
    pages:{
        signIn: '/login'
    },
    session:{
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60
    },
    providers: [
        Credentials({
            name: 'Credentials',
            async authorize(credentials) {
                'use server';
                return {
                    id: credentials?.id + "",
                    email: credentials?.email,
                    name: credentials?.name,
                    role: (credentials?.id??'0') == '1' ? 'admin' : 'user',
                    dob: (credentials?.dob??"None").toString()
                };
            },
            credentials: {
                id: { label: "id", type:"text"},
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
                name: { label: "username", type:"text"},
                dob: { label:"dob", type:"datetime"},
            },
        })
    ],
    secret : process.env.NEXTAUTH_SECRET,
    callbacks: { 
        async session({session, token }){
            session.name  = token.name??"Jane Doe";
            session.role = token.role??"user";
            session.email = token.email??"janedoe@gmail.com";
            session.dob = token.dob??"None";
            session.id = parseInt(token.id??"-1");
            return session;
        }, 
        async jwt({token, user}){
            if(user){
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = parseInt(user.id??"0") == 1 ?"admin":'user';
                token.dob = user.dob??"None"
            }
            return token;
        },      
    }
    }
