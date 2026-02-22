import * as React from "react"
import { Home, FileText, type LucideIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
}

const navItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Editor", url: "/editor", icon: FileText },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
