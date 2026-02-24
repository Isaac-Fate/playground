import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useMatches, Link } from "@tanstack/react-router";

type BreadcrumbSegment = { label: string; path?: string };

function getFullBreadcrumbs(
  pathname: string,
  document?: { title: string },
): BreadcrumbSegment[] {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  if (normalizedPath === "/") {
    return [{ label: "Home" }];
  }

  if (normalizedPath === "/editor") {
    return [{ label: "Editor" }];
  }

  if (normalizedPath === "/stopwatch") {
    return [{ label: "Stopwatch" }];
  }

  if (/^\/editor\/documents\/.+/.test(normalizedPath)) {
    return [
      { label: "Editor", path: "/editor" },
      { label: document?.title ?? "Document" },
    ];
  }

  return [{ label: "Page" }];
}

export function Header() {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];
  const pathname = currentMatch?.pathname ?? "/";
  const docMatch = matches.find(
    (m) => m.routeId === "/_main/editor/documents/$id",
  );
  const document = docMatch?.loaderData as
    | { id: string; title: string; content: string }
    | undefined;

  const breadcrumbs = getFullBreadcrumbs(pathname, document);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height-collapsed)">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((segment, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden md:inline-flex" />
                )}
                <BreadcrumbItem className="hidden md:inline-flex">
                  {segment.path != null && index < breadcrumbs.length - 1 ? (
                    <BreadcrumbLink asChild>
                      <Link
                        to={segment.path}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {segment.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
