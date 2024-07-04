import Link from "next/link";

function Footer() {
  return (
    <div className="sticky top-full text-slate-500 text-sm mx-8 md:mx-20 font-light">
      <footer className="z-40 py-6 mx-auto md:flex max-w-[1400px]">
        <h2 className="">© 2024 Imagen. All rights reserved.</h2>
        <div className="ml-auto flex mt-3 md:mt-0 gap-5">
          <Link
            href="mailto:sa6ds1@gmail.com"
            target=""
            className="hover:underline hover:text-orange-500"
          >
            Contact
          </Link>
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
