import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo.png";
import { Button } from "./ui/button";

export default function Nav() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center">
        <Image src={Logo} alt="logo" className="w-7 h-w-7" />

        <span className="ml-2 text-lg font-bold">Planbox</span>
      </Link>

      <nav className="flex items-center gap-2">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>

        <Button variant="ghost" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </nav>
    </header>
  );
}
