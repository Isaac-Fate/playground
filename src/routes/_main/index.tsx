import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, FlaskConical, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_main/")({ component: HomePage });

const demos = [
  {
    title: "Minimal Editor",
    description:
      "A simple rich-text editor built from scratch using contentEditable, demonstrating DOM manipulation, selection API, and keyboard shortcuts.",
    href: "/editor",
    icon: FileText,
    tags: ["DOM", "contentEditable", "Selection API"],
  },
];

function HomePage() {
  return (
    <div className="space-y-10">
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <FlaskConical className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">
            A space for demonstrating and experimenting with web development
            concepts. Each demo is a self-contained example you can explore,
            modify, and learn from.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Demos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {demos.map((demo) => (
              <Link
                key={demo.href}
                to={demo.href}
                className="border-border hover:border-primary/40 hover:bg-accent/50 group rounded-xl border p-5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <demo.icon className="size-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="leading-none font-semibold">
                      {demo.title}
                      <ArrowRight className="ml-1 inline-block size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {demo.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {demo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
    </div>
  );
}
