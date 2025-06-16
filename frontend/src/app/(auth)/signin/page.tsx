"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInWithGoogle } from "@/app/actions/signInWithGoogle";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-16 items-center px-4">
        <Button className="bg-secondary hover:bg-secondary/80" size={"lg"}>
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="mx-auto w-full max-w-md  bg-secondary">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-foreground leading-tight">
              Welcome to Recall
            </CardTitle>
            <CardDescription>
              Sign in to access your smart bookmarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex items-center justify-center w-full">
            <Button
              className="w-9/12 bg-foreground text-secondary hover:bg-foreground/90 py-6 cursor-pointer"
              variant="default"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full h-full justify-center">
                  {/* Google Icon */}
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground">
            <p className="w-full text-xs">
              We respect your privacy. Your data stays with you.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
