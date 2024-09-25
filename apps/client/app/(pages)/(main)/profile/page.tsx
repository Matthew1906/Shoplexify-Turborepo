import Image from "next/image";
import { authOptions } from "@/app/lib/auth";
import { roboto_bold, roboto_regular } from "@/app/lib/font";
import { transactionResponse } from "@/app/lib/interface";
import { dateString } from "@/app/lib/string";
import { getTransactions } from "@/app/services/transactions";
import { getServerSession } from "next-auth";
import { ProfileForm, TransactionCard } from "./ui";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title:"My Profile - Shoplexify"
}

export default async function ProfilePage(){
    const profile = await getServerSession(authOptions);
    const transactions: Array<transactionResponse> | undefined = await getTransactions();
    return <main className={`lg:grid lg:grid-cols-2 lg:gap-5 p-5 lg:p-10 ${roboto_regular.className}`}>
        <section id="profile-info">
            <div className="border-navy-blue border-2 rounded-lg p-4 lg:p-8 flex items-center gap-5">
                <Image
                    src={"https://ui-avatars.com/api/?background=random&rounded=true&size=256&name="+profile?.name?.split(" ").join("+")}
                    alt={"Profile Image of " + profile?.name}
                    width={100}
                    height={100}
                />
                <div className="lg:text-xl col-span-2">
                    <h5 className="font-bold mb-2">{profile?.name}</h5>
                    <p className="mb-2 underline">{profile?.email}</p>
                    {profile?.dob!=="None" && <p className="font-semibold">{profile?.dob!=='null' ? dateString(new Date(profile?.dob??"")):"No DOB yet"}</p>}
                </div>
            </div>
            <ProfileForm dob={new Date(profile?.dob??"")} />
        </section>
        {profile?.role == 'user' && 
            <section id="transactions" className="border-navy-blue border-2 rounded-lg p-5">
                <h4 className={`mb-4 text-lg lg:text-2xl ${roboto_bold.className}`}>My Orders</h4>
                {(transactions??[]).map((transaction:transactionResponse)=>{
                    return <TransactionCard key={transaction.id} transaction={transaction} />
                })}
            </section>
        }
    </main>
}
