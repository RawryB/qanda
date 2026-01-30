"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Question = {
  id: string;
  type: string;
  title: string;
  helpText: string | null;
  renderedTitle?: string;
  renderedHelpText?: string | null;
  required: boolean;
  key: string;
  choices?: Array<{ value: string; label: string }>;
};

type FormState = "loading" | "start" | "question" | "completed";

export default function QandaRunnerPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [state, setState] = useState<FormState>("loading");
  const [formName, setFormName] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch form name for start screen
    const fetchFormName = async () => {
      try {
        const response = await fetch(`/api/qanda/public/form-info?slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setFormName(data.name);
        } else {
          setError("Form not found or not published");
        }
      } catch (err) {
        setError("Failed to load form");
      }
      setState("start");
    };
    if (slug) {
      fetchFormName();
    }
  }, [slug]);

  const handleStart = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/qanda/public/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start form");
      }

      setSubmissionId(data.submissionId);
      if (data.form?.name) {
        setFormName(data.form.name);
      }
      setCurrentQuestion(data.question);
      setStepIndex(data.stepIndex ?? 0);
      setState("question");
    } catch (err: any) {
      setError(err.message || "Failed to start form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!submissionId || !currentQuestion) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/qanda/public/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          questionId: currentQuestion.id,
          value: answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save answer");
      }

      if (data.completed) {
        // Submission is already completed by the answer endpoint
        setState("completed");

        // Redirect if redirectUrl exists
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        // Move to next question
        setCurrentQuestion(data.nextQuestion);
        setStepIndex(data.stepIndex ?? stepIndex + 1);
        setAnswer("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = async () => {
    if (!submissionId) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/qanda/public/back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to go back");
      }

      if (data.atStart) {
        // Already at start, do nothing
        return;
      }

      // Update question and stepIndex
      setCurrentQuestion(data.question);
      setStepIndex(data.stepIndex);

      // Prefill answer if existingAnswer exists
      if (data.existingAnswer) {
        if (data.question.type === "yesno") {
          // For yesno, existingAnswer.valueText might be "true"/"false" or valueJson might be boolean
          const answerValue = data.existingAnswer.valueText || data.existingAnswer.valueJson;
          if (answerValue === true || answerValue === "true") {
            setAnswer("yes");
          } else if (answerValue === false || answerValue === "false") {
            setAnswer("no");
          } else {
            setAnswer(answerValue || "");
          }
        } else {
          setAnswer(data.existingAnswer.valueText || data.existingAnswer.valueJson || "");
        }
      } else {
        setAnswer("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to go back");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <input
            type={currentQuestion.type === "email" ? "email" : currentQuestion.type === "phone" ? "tel" : "text"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required={currentQuestion.required}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        );

      case "yesno":
        return (
          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="yesno"
                value="yes"
                checked={answer === "yes"}
                onChange={(e) => setAnswer(e.target.value)}
                required={currentQuestion.required}
              />
              Yes
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="yesno"
                value="no"
                checked={answer === "no"}
                onChange={(e) => setAnswer(e.target.value)}
                required={currentQuestion.required}
              />
              No
            </label>
          </div>
        );

      case "multi":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {currentQuestion.choices?.map((choice) => (
              <label
                key={choice.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <input
                  type="radio"
                  name="choice"
                  value={choice.value}
                  checked={answer === choice.value}
                  onChange={(e) => setAnswer(e.target.value)}
                  required={currentQuestion.required}
                />
                {choice.label}
              </label>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required={currentQuestion.required}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            <option value="">Select an option...</option>
            {currentQuestion.choices?.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (state === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (state === "start") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "2rem",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {formName || "Loading..."}
        </h1>
        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "1rem",
            }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleStart}
          disabled={isSubmitting}
          style={{
            padding: "0.75rem 2rem",
            backgroundColor: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? "Starting..." : "Start"}
        </button>
      </div>
    );
  }

  if (state === "question" && currentQuestion) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "600px",
          margin: "2rem auto",
          gap: "1.5rem",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {currentQuestion.renderedTitle ?? currentQuestion.title}
        </h2>

        {(currentQuestion.renderedHelpText ?? currentQuestion.helpText) && (
          <p
            style={{
              fontSize: "1rem",
              color: "#666",
              margin: 0,
            }}
          >
            {currentQuestion.renderedHelpText ?? currentQuestion.helpText}
          </p>
        )}

        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {renderInput()}

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting || stepIndex === 0}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: stepIndex === 0 ? "#e5e5e5" : "#fff",
                color: stepIndex === 0 ? "#999" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: stepIndex === 0 || isSubmitting ? "not-allowed" : "pointer",
                opacity: stepIndex === 0 || isSubmitting ? 0.6 : 1,
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#0066cc",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
                flex: 1,
              }}
            >
              {isSubmitting ? "Saving..." : "Next"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (state === "completed") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Done
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#666",
          }}
        >
          Thank you for your submission!
        </p>
      </div>
    );
  }

  return null;
}
