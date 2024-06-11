import "./globals.css";
import { Inter } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { themeEffect } from "./themeEffect";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeEffect.toString()})();`,
          }}
        />
      </head>
      <body
        className={` ${inter.className} dark:bg-slate-900 m-0 text-slate-700 dark:text-slate-200 bg-slate-50 min-h-[100vh]`}
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
