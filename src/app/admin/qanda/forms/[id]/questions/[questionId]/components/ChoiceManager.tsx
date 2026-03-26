"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { createChoice, deleteChoice, reorderChoice, updateChoice } from "../../actions";

type Choice = { id: string; order: number; value: string; label: string };

export function ChoiceManager({ questionId, choices: initialChoices }: { questionId: string; choices: Choice[] }) {
  const router = useRouter();
  const [choices, setChoices] = useState(initialChoices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingChoiceId, setDraggingChoiceId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => setChoices(initialChoices), [initialChoices]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("value", newValue);
    formData.append("label", newLabel);
    try {
      await createChoice(questionId, formData);
      setNewValue("");
      setNewLabel("");
      setShowAddForm(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to create choice");
    }
  };

  const handleUpdate = async (choiceId: string, value: string, label: string) => {
    const formData = new FormData();
    formData.append("value", value);
    formData.append("label", label);
    try {
      await updateChoice(choiceId, formData);
      setEditingId(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to update choice");
    }
  };

  const handleDelete = async (choiceId: string) => {
    if (!confirm("Are you sure you want to delete this choice?")) return;
    try {
      await deleteChoice(choiceId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete choice");
    }
  };

  const handleDropOnChoice = async (targetChoice: Choice) => {
    if (!draggingChoiceId || draggingChoiceId === targetChoice.id) return;
    try {
      await reorderChoice(questionId, draggingChoiceId, targetChoice.order);
      setDraggingChoiceId(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to reorder choice");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="type-heading-lg m-0">Choices</h2>
        {!showAddForm && <Button onClick={() => setShowAddForm(true)}>Add choice</Button>}
      </div>

      {showAddForm && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="type-body-sm ui-text-primary">
                Value <span className="text-[var(--danger-fg)]">*</span>
              </label>
              <Input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="type-body-sm ui-text-primary">
                Label <span className="text-[var(--danger-fg)]">*</span>
              </label>
              <Input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add</Button>
              <Button variant="ghost" type="button" onClick={() => { setShowAddForm(false); setNewValue(""); setNewLabel(""); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {choices.length === 0 ? (
        <p className="type-body-md ui-text-secondary">No choices yet. Add your first choice above.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {choices.map((choice, index) => (
            <Card
              key={choice.id}
              className="p-4"
              draggable={editingId !== choice.id}
              onDragStart={() => {
                if (editingId !== choice.id) setDraggingChoiceId(choice.id);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOnChoice(choice)}
            >
              {editingId === choice.id ? (
                <EditChoiceForm choice={choice} onSave={(value, label) => handleUpdate(choice.id, value, label)} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="type-meta-sm ui-text-secondary">#{choice.order + 1}</span>
                    <span className="type-body-md ui-text-primary">{choice.label}</span>
                    <span className="type-body-sm ui-text-secondary">({choice.value})</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="px-2" title="Drag to reorder">⠿</Button>
                    <Button variant="ghost" size="sm" className="px-2" title="Edit choice" onClick={() => setEditingId(choice.id)}>✎</Button>
                    <Button variant="ghost" size="sm" className="px-2 text-[var(--danger-fg)]" title="Delete choice" onClick={() => handleDelete(choice.id)}>🗑</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EditChoiceForm({
  choice,
  onSave,
  onCancel,
}: {
  choice: Choice;
  onSave: (value: string, label: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(choice.value);
  const [label, setLabel] = useState(choice.label);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value, label);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="type-body-sm ui-text-primary">Value</label>
          <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="type-body-sm ui-text-primary">Label</label>
          <Input type="text" value={label} onChange={(e) => setLabel(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
