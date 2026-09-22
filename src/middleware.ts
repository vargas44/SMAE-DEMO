import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      const dest =
        role === "NUTRIOLOGO" ? "/nutriologo" : "/paciente";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/nutriologo")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "NUTRIOLOGO") {
      return NextResponse.redirect(new URL("/paciente", req.url));
    }
  }

  if (pathname.startsWith("/paciente")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "PACIENTE") {
      return NextResponse.redirect(new URL("/nutriologo", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/nutriologo/:path*", "/paciente/:path*"],
};
