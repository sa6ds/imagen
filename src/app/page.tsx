"use client";
import Link from "next/link";
import { useAuthUser } from "./components/auth/useAuthUser";

const Home = () => {
  const { user, signInWithGoogle } = useAuthUser();

  return (
    <main className="container mx-auto px-16 py-12">
      <div className="mt-0 lg:mt-20 lg:text-center lg:mx-5">
        <div className="relative z-50">
          <h1 className="dark:text-white text-slate-900 z-50 pb-8 tracking-tighter text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            Generate images with a click of a button!
          </h1>
          <p className="z-50 lg:mx-24 mb-16">
            Ignite your imagination with sketches that come to life. Our
            intuitive AI web app transforms your drawings into breathtaking
            images, making artistic dreams a reality.
          </p>
          <div className="flex mx-auto w-full sm:w-[500px] md:w-[600px] lg:w-[640px] justify-center items-stretch mt-2">
            <div className="space-x-0 md:space-x-4 space-y-4 md:space-y-0 flex flex-col md:flex-row items-start justify-start lg:items-center md:justify-center w-full">
              <Link
                href="/collection"
                type="button"
                className="transition duration-50 ease-in-out delay-100 text-white font-medium bg-gradient-to-b from-orange-500 to-red-500 border-b-4 border-orange-700 hover:shadow-lg hover:bg-gradient-to-b rounded-lg px-5 py-2 text-base"
              >
                View Collection
              </Link>
              <div className="relative flex items-center">
                {user ? (
                  <Link
                    href="/generate"
                    className="transition duration-50 ease-in-out delay-100 text-white font-medium bg-gradient-to-b from-orange-500 to-red-500 border-b-4 border-orange-700 hover:shadow-lg hover:bg-gradient-to-b rounded-lg px-5 py-2 text-base"
                  >
                    Generate Now
                  </Link>
                ) : (
                  <button
                    onClick={signInWithGoogle}
                    className="transition duration-50 ease-in-out delay-100 text-white font-medium bg-gradient-to-b from-orange-500 to-red-500 border-b-4 border-orange-700 hover:shadow-lg hover:bg-gradient-to-b rounded-lg px-5 py-2 text-base"
                  >
                    Try for free
                  </button>
                )}

                <div className="bg-green-50 absolute -top-1 right-0">
                  <span className="absolute flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 dark:bg-white opacity-75"></span>
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="-z-10 absolute -top-24 left-1/2 transform -translate-x-1/2 w-96 h-96 md:w-[650px] md:h-[400px] bg-gradient-to-r dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 from-yellow-500 via-orange-500 to-pink-500 rounded-full mix-blend-multiply blur-3xl filter opacity-40" />
          <div className="-z-10 absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-96 h-96 md:w-[650px] md:h-[400px] bg-gradient-to-r dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 from-yellow-500 via-orange-500 to-pink-500 rounded-full mix-blend-multiply blur-3xl filter opacity-40" />
        </div>
      </div>
    </main>
  );
};

export default Home;
