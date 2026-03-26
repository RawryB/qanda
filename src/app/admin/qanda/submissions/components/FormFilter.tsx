"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui";

export function FormFilter({ forms, currentFormId }: { forms: Array<{ id: string; name: string }>; currentFormId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (formId) params.set("formId", formId);
    else params.delete("formId");
    const query = params.toString();
    router.push(query ? `/admin/qanda/submissions?${query}` : "/admin/qanda/submissions");
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="formFilter" className="type-body-sm ui-text-primary">Filter by form:</label>
      <Select id="formFilter" value={currentFormId || ""} onChange={handleChange} className="max-w-[280px]">
        <option value="">All forms</option>
        {forms.map((form) => (
          <option key={form.id} value={form.id}>{form.name}</option>
        ))}
      </Select>
    </div>
  );
}
