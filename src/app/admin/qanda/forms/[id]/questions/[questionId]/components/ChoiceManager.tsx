"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createChoice,
  updateChoice,
  deleteChoice,
  moveChoice,
} from "../../actions";

type Choice = {
  id: string;
  order: number;
  value: string;
  label: string;
};

export function ChoiceManager({
  questionId,
  choices: initialChoices,
}: {
  questionId: string;
  choices: Choice[];
}) {
  const router = useRouter();
  const [choices, setChoices] = useState(initialChoices);

  // Update choices when props change (after refresh)
  useEffect(() => {
    setChoices(initialChoices);
  }, [initialChoices]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");

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
    if (!confirm("Are you sure you want to delete this choice?")) {
      return;
    }

    try {
      await deleteChoice(choiceId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete choice");
    }
  };

  const handleMove = async (choiceId: string, direction: "up" | "down") => {
    try {
      await moveChoice(questionId, choiceId, direction);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to move choice");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Choices
        </h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Add Choice
          </button>
        )}
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: "4px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              Value <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              Label <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#0066cc",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewValue("");
                setNewLabel("");
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f0f0f0",
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {choices.length === 0 ? (
        <p
          style={{
            color: "#666",
            fontSize: "1rem",
          }}
        >
          No choices yet. Add your first choice above.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {choices.map((choice, index) => (
            <div
              key={choice.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {editingId === choice.id ? (
                <EditChoiceForm
                  choice={choice}
                  onSave={(value, label) => handleUpdate(choice.id, value, label)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        #{choice.order + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: "500",
                        }}
                      >
                        {choice.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        ({choice.value})
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => handleMove(choice.id, "up")}
                      disabled={index === 0}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#fff",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        opacity: index === 0 ? 0.6 : 1,
                        fontSize: "0.9rem",
                      }}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(choice.id, "down")}
                      disabled={index === choices.length - 1}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#fff",
                        cursor: index === choices.length - 1 ? "not-allowed" : "pointer",
                        opacity: index === choices.length - 1 ? 0.6 : 1,
                        fontSize: "0.9rem",
                      }}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => setEditingId(choice.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(choice.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value, label);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            flex: 1,
          }}
        >
          <label
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            flex: 1,
          }}
        >
          <label
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f0f0f0",
            color: "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
