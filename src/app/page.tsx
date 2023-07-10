"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";

const Home = () => {
  return (
    <div className="h-screen">
      <div className="container mx-auto px-12 py-12">
        <Navbar />
        <div className="flex items-center justify-center">
          <div className="mt-24 lg:mt-48 lg:text-center lg:mx-5 flex flex-col justify-center">
            <div className="relative z-50">
              <h1 className="dark:text-white z-50 pb-8 mt-12 tracking-tighter text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
                Generate images with a click of a button!
              </h1>
              <p className="dark:text-slate-200 z-50 lg:mx-24 mb-16 text-slate-700">
                Ignite your imagination with doodles that come to life. Our
                intuitive AI web app transforms your drawings into breathtaking
                images, making artistic dreams a reality.
              </p>
              <Link
                href="/generate"
                className="border-grey-100 mx-auto rounded-lg border-b-4 border-orange-700 bg-gradient-to-b from-orange-500 to-red-500 px-8 py-2 text-white ease-in-out"
              >
                Try for free
              </Link>
              <div className="-z-10 absolute -top-10 left-1/2 transform -translate-x-1/2 w-96 h-96 md:w-[650px] md:h-[400px] bg-gradient-to-r dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 from-yellow-500 via-orange-500 to-pink-500 rounded-full  mix-blend-multiply blur-3xl filter opacity-40" />
              <div className="-z-10 absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-96 h-96 md:w-[650px] md:h-[400px] bg-gradient-to-r dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 from-yellow-500 via-orange-500 to-pink-500 rounded-full mix-blend-multiply blur-3xl filter  opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
