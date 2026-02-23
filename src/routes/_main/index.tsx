import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_main/")({ component: HomePage });

const demos = [
  {
    title: "Document Editor",
    description: "Plain text editor with auto-save.",
    href: "/editor",
    icon: FileText,
  },
];

function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col justify-center py-16 md:py-24">
        <div className="space-y-6">
          <h1 className="text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Playground
          </h1>
          <p className="max-w-xl text-lg font-normal leading-relaxed text-muted-foreground">
            A space for experimenting with web development concepts. Each demo
            is self-contained—explore, modify, and learn.
          </p>
        </div>
      </section>

      {/* Demos */}
      <section className="border-border/60 border-t pt-12">
        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Demos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {demos.map((demo) => (
            <Link
              key={demo.href}
              to={demo.href}
              className="group flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/40"
            >
              <div className="text-muted-foreground shrink-0 transition-colors group-hover:text-foreground">
                <demo.icon className="size-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{demo.title}</h3>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {demo.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
