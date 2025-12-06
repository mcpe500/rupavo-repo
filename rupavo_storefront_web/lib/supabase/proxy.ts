import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // If the env vars are not set, skip proxy check. You can remove this
    // once you setup the project.
    if (!hasEnvVars) {
        return supabaseResponse;
    }

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const path = request.nextUrl.pathname;
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    const STATIC_PUBLIC_PATHS = new Set(["/", "/login"]);
    const PUBLIC_PREFIXES = ["/auth"];
    const isPublicPath =
        STATIC_PUBLIC_PATHS.has(path) ||
        PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));

    let isPublishedStorefrontRoute = false;
    if (!isPublicPath) {
        const segments = path.split("/").filter(Boolean);
        if (segments.length === 1) {
            const slug = segments[0];
            const { data: storefront } = await supabase
                .from("shops")
                .select("id")
                .eq("slug", slug)
                .eq("storefront_published", true)
                .limit(1);

            isPublishedStorefrontRoute = Boolean(storefront?.length);
        }
    }

    if (!user && !isPublicPath && !isPublishedStorefrontRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
