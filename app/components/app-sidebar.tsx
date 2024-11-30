import * as React from "react"
import {
    BookOpen,
    Bot,
    Command,
    Frame, GitCompareArrows,
    LifeBuoy, ListCheckIcon,
    Map,
    PieChart,
    Send,
    Settings2,
    WholeWordIcon,
} from "lucide-react"

import {NavMain} from "~/components/nav-main"
import {NavProjects} from "~/components/nav-projects"
import {NavSecondary} from "~/components/nav-secondary"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar"

const data = {
    navMain: [
        {
            title: "Wort des Tages",
            url: "#",
            icon: WholeWordIcon,
            isActive: true,
            items: [
                {
                    title: "Wort des Tages",
                    url: "/",
                },
                {
                    title: "Liste",
                    url: "/word-list",
                }
            ],
        },
        {
            title: "Text Korrektur",
            url: "/text-check",
            icon: ListCheckIcon,
            isActive: true,
            items: [
                {
                    title: "Text eingabe",
                    url: "/text-check",
                },
                {
                    title: "Liste",
                    url: "/text-list",
                }
            ],
        },
        {
            title: "Synonym",
            url: "#",
            icon: GitCompareArrows,
            isActive: true,
            items: [
                {
                    title: "Generieren",
                    url: "/synonyme",
                },
                {
                    title: "Liste",
                    url: "/synonyme-list",
                }
            ],
        },
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
            <Sidebar variant="inset" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4"/>
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Name</span>
                                        <span className="truncate text-xs">Name</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={data.navMain}/>
                </SidebarContent>
                <SidebarFooter>
                </SidebarFooter>
            </Sidebar>
    )
}
