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
        style={{
          width: "240px",
          minHeight: "100vh",
          borderRight: "1px solid #e5e5e5",
          padding: "2rem 1rem",
          backgroundColor: "#fafafa",
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
            style={{
              padding: "0.75rem 1rem",
              color: "#0066cc",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "400",
              borderRadius: "4px",
            }}
          >
            SwimFast
          </Link>
          <Link
            href="/admin/qanda"
            style={{
              padding: "0.75rem 1rem",
              color: "#000",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "500",
              borderRadius: "4px",
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
