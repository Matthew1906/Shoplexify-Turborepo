import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";

export async function GET(request:NextRequest){
    const session = await getServerSession(authOptions);
    return NextResponse.json({authenticated:!!session, ...session});
}