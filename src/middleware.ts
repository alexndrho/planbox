import { auth } from "./lib/auth";

export default auth((request) => {
  if (!request.auth && request.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", request.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = { matcher: ["/home(.*)"] };
