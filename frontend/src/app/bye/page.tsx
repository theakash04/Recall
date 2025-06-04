import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function ByePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 overflow-hidden ">
      <header className="container mx-auto flex h-16 items-center px-4">
        <Button className="bg-secondary hover:bg-secondary/80" size={"lg"}>
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <span className="text-sm">Back to home</span>
          </Link>
        </Button>
      </header>
      <div className="flex-1">
        <div className="w-full max-w-md aspect-square flex items-center justify-center ">
          <Image
            src={"./thanks_betrayed.svg"}
            alt="Bye"
            width={1800}
            height={1800}
            priority
          />
        </div>
      </div>
    </div>
  );
}
