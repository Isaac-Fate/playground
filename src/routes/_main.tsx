import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Header } from "@/components/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_main")({
  component: MainLayout,
});

function MainLayout() {
  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0">
        <Header />
        <main className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto overscroll-contain p-6 md:p-10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
