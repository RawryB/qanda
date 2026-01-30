"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FormFilter({ forms, currentFormId }: { forms: Array<{ id: string; name: string }>; currentFormId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (formId) {
      params.set("formId", formId);
    } else {
      params.delete("formId");
    }
    
    router.push(`/admin/qanda/submissions?${params.toString()}`);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <label
        htmlFor="formFilter"
        style={{
          fontSize: "0.9rem",
          fontWeight: "500",
        }}
      >
        Filter by form:
      </label>
      <select
        id="formFilter"
        value={currentFormId || ""}
        onChange={handleChange}
        style={{
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "1rem",
        }}
      >
        <option value="">All forms</option>
        {forms.map((form) => (
          <option key={form.id} value={form.id}>
            {form.name}
          </option>
        ))}
      </select>
    </div>
  );
}
