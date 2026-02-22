import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Header } from "@/components/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const Route = createFileRoute("/_main")({
  component: MainLayout,
})

function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex min-h-0 flex-1 flex-col p-6 md:p-10">
          <div className="mx-auto w-full max-w-4xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
