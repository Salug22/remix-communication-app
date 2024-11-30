import {Links, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";
import "./tailwind.css";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "~/components/ui/sidebar";
import {AppSidebar} from "~/components/app-sidebar";

export function Layout({children}: { children: React.ReactNode }) {
    return (
            <html lang="en">
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <link rel="manifest" href="/manifest.json"/>
                <Links/>
            </head>
            <body>
            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1"/>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <ScrollRestoration/>
            <Scripts/>
            </body>
            </html>
    );
}

export default function App() {
    return <Outlet/>;
}
