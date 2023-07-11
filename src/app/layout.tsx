import "./globals.css";
import { Inter } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Imagen",
  description: "Generate images with a click of a button!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={` ${inter.className} dark:bg-slate-900 bg-slate-50 min-h-[100vh]`}
      >
        <ConvexClientProvider>
          <Navbar />
          {children}
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
