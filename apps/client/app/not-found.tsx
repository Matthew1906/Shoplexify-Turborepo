import Link from 'next/link'
import { TextButton } from '@/app/components/buttons'
import { Header } from '@/app/components/partials'
import { roboto_light, roboto_regular, roboto_semibold } from '@/app/lib/font'
 
export default function NotFound() {
  return (
    <>
      <Header isAuth={true} isLoggedIn={false} isAdmin={false}/>
      <main className='grow p-10 flex-center flex-col'>
        <h2 className={`text-9xl ${roboto_light.className} mb-5`}>404</h2>
        <h2 className={`text-3xl ${roboto_semibold.className} mb-3`}>Page not found</h2>
        <p className={`text-xl ${roboto_regular.className} mb-4`}>The page you are looking for doesn&apos;t exist! It might have been moved or deleted... </p>
        <Link href="/"><TextButton text="Back to Home" /></Link>
      </main>
    </>
  )
}