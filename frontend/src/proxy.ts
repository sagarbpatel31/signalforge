import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { clerkEnabled } from "@/lib/auth-config";

const publicPaths = ["/sign-in", "/sign-up"];

const proxy = clerkEnabled
  ? clerkMiddleware(async (auth, request) => {
      const isPublic = publicPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      );
      if (!isPublic) await auth.protect();
    })
  : () => NextResponse.next();

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
