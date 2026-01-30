import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButtonWrapper } from "./components/UserButtonWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* Left Sidebar Navigation */}
      <aside
        className="glass-card-subtle"
        style={{
          width: "240px",
          minHeight: "100vh",
          padding: "2rem 1rem",
          marginRight: "1rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Link
            href="/"
            className="text-primary"
            style={{
              padding: "0.75rem 1rem",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "400",
              borderRadius: "8px",
              transition: "all 250ms ease",
              display: "block",
            }}
          >
            SwimFast
          </Link>
          <Link
            href="/admin/qanda"
            className="text-primary"
            style={{
              padding: "0.75rem 1rem",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "500",
              borderRadius: "8px",
              transition: "all 250ms ease",
              display: "block",
            }}
          >
            Qanda
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2rem",
          }}
        >
          <UserButtonWrapper />
        </div>
        {children}
      </main>
    </div>
  );
}
