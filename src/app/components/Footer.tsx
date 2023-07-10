import Link from "next/link";
import Image from "next/image";
function Footer() {
  return (
    <div className="sticky top-full text-slate-500 text-sm mb-10 mx-12 md:mx-32 font-light">
      <footer className="z-40 py-6 mx-auto md:flex max-w-[1400px]">
        <h2 className="">© 2023 Imagen. All rights reserved.</h2>
        <div className="ml-auto flex mt-3 md:mt-0 gap-5">
          <Link
            href="mailto:sa6ds1@gmail.com"
            target=""
            className="hover:underline hover:text-orange-500"
          >
            Contact
          </Link>
          {/* <Link
            href=""
            target=""
            className="hover:underline hover:text-orange-500"
          >
            Discord
          </Link> */}
          {/* <Link
            href=""
            target="_blank"
            className="hover:underline hover:text-orange-500"
          >
            Twitter
          </Link> */}
          <Link
            target=""
            href="/terms"
            className="hover:underline hover:text-orange-500"
          >
            Terms
          </Link>

          <Link
            target=""
            href="/privacy"
            className="hover:underline hover:text-orange-500"
          >
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
