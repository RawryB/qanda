import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButtonWrapper } from "./components/UserButtonWrapper";
import { cn } from "@/components/ui/cn";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const navItemClass =
    "block rounded-[6px] px-3 py-2 no-underline transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]";

  return (
    <div className="flex min-h-screen">
      <aside className="ui-surface-nav w-[196px] border-r border-[var(--border-subtle)] p-4">
        <div className="mb-4 border-b border-[var(--border-subtle)] pb-4">
          <Link href="/" className="type-heading-md ui-text-primary no-underline">
            Q<span className="ui-text-muted">&amp;</span>A
          </Link>
        </div>
        <div className="mb-2 type-label-sm uppercase tracking-[0.12em] ui-text-tertiary">Workspace</div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin/qanda/forms"
            className={cn(navItemClass, "type-body-sm ui-text-secondary hover:bg-[var(--bg-field)] hover:ui-text-primary")}
          >
            Home
          </Link>
          <Link
            href="/admin/qanda/submissions"
            className={cn(navItemClass, "type-body-sm ui-text-secondary hover:bg-[var(--bg-field)] hover:ui-text-primary")}
          >
            Submissions
          </Link>
          <Link
            href="/admin/qanda/settings"
            className={cn(navItemClass, "type-body-sm ui-text-secondary hover:bg-[var(--bg-field)] hover:ui-text-primary")}
          >
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex flex-1 flex-col p-8">
        <div className="mb-8 flex justify-end">
          <UserButtonWrapper />
        </div>
        {children}
      </main>
    </div>
  );
}
