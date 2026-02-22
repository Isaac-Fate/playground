import { Link, useRouterState } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import type { NavItem } from "@/components/app-sidebar"

export function NavMain({ items }: { items: NavItem[] }) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={
                currentPath === item.url ||
                (item.url !== "/" && currentPath.startsWith(item.url))
              }
            >
              <Link to={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
