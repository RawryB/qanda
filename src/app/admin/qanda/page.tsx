import Link from "next/link";

export default function QandaPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          margin: 0,
        }}
      >
        Qanda
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#666",
          margin: 0,
        }}
      >
        Admin module
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Link
          href="/admin/qanda/forms"
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "1rem",
          }}
        >
          Forms
        </Link>
        <Link
          href="/admin/qanda/submissions"
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "1rem",
          }}
        >
          Submissions
        </Link>
        <Link
          href="/admin/qanda/settings"
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "1rem",
          }}
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
