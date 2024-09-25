import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "./components/partials";
import { AuthProvider } from "./providers";

export const metadata: Metadata = {
  title: "Shoplexify",
  description: "Online Shop Application made using Next.js and Prisma ORM by Matthew Adrianus Mulyono",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col justify-stretch min-h-screen">
        <AuthProvider>
            {children} 
        </AuthProvider> 
        <Footer/>
      </body>
    </html>
  );
}
