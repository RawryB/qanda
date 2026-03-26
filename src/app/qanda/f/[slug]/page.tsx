"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [introText, setIntroText] = useState<string | null>(null);
  const [completionTitle, setCompletionTitle] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedIntroText =
    introText ||
    "Thanks for you interest in coaching, answering these questions will give me the best insights into how I can best help you Swim Faster. Should only take a few minutes and I'll get back to you ASAP.";

  const resolvedCompletionTitle = completionTitle || "Done";
  const resolvedCompletionMessage = completionMessage || "Thank you for your submission!";

  useEffect(() => {
    // Fetch form name for start screen
    const fetchFormName = async () => {
      try {
        const response = await fetch(`/api/forms/public/form-info?slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setFormName(data.name);
          setIntroText(data.introText ?? null);
          setCompletionTitle(data.completionTitle ?? null);
          setCompletionMessage(data.completionMessage ?? null);
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
      const response = await fetch("/api/forms/public/start", {
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
      if (data.form?.backgroundImageUrl) {
        setBackgroundImageUrl(data.form.backgroundImageUrl);
      }
      if (data.form?.introText !== undefined) {
        setIntroText(data.form.introText ?? null);
      }
      if (data.form?.completionTitle !== undefined) {
        setCompletionTitle(data.form.completionTitle ?? null);
      }
      if (data.form?.completionMessage !== undefined) {
        setCompletionMessage(data.form.completionMessage ?? null);
      }
      if (data.totalQuestions) {
        setTotalQuestions(data.totalQuestions);
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
      const response = await fetch("/api/forms/public/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          questionId: currentQuestion.id,
          value: currentQuestion.type === "instruction" ? null : answer,
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
        if (data.totalQuestions) {
          setTotalQuestions(data.totalQuestions);
        }
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
      const response = await fetch("/api/forms/public/back", {
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
      if (data.totalQuestions) {
        setTotalQuestions(data.totalQuestions);
      }

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
      case "instruction":
        // Instruction questions have no input
        return null;

      case "text":
      case "email":
      case "phone":
        return (
          <input
            type={currentQuestion.type === "email" ? "email" : currentQuestion.type === "phone" ? "tel" : "text"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required={currentQuestion.required}
            className="glass-input"
          />
        );

      case "yesno":
        return (
          <div className="glass-radio-group">
            <label
              className={`glass-radio-option ${answer === "yes" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="yesno"
                value="yes"
                checked={answer === "yes"}
                onChange={(e) => setAnswer(e.target.value)}
                required={currentQuestion.required}
                style={{ marginRight: "0.5rem" }}
              />
              Yes
            </label>
            <label
              className={`glass-radio-option ${answer === "no" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="yesno"
                value="no"
                checked={answer === "no"}
                onChange={(e) => setAnswer(e.target.value)}
                required={currentQuestion.required}
                style={{ marginRight: "0.5rem" }}
              />
              No
            </label>
          </div>
        );

      case "multi":
        return (
          <div className="glass-radio-group">
            {currentQuestion.choices?.map((choice) => (
              <label
                key={choice.value}
                className={`glass-radio-option ${answer === choice.value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="choice"
                  value={choice.value}
                  checked={answer === choice.value}
                  onChange={(e) => setAnswer(e.target.value)}
                  required={currentQuestion.required}
                  style={{ marginRight: "0.5rem" }}
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
            className="glass-select"
          >
            <option value="">Select an option...</option>
            {currentQuestion.choices?.map((choice) => (
              <option key={choice.value} value={choice.value} style={{ background: "#1e3a8a", color: "white" }}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  // Container style with background image
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    ...(backgroundImageUrl
      ? {
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
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
        className="text-primary"
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (state === "start") {
    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem 1rem",
            maxWidth: "800px",
            margin: "0 auto",
            gap: "2rem",
          }}
        >
          {/* Header with Logo */}
          <div className="runner-header">
            <div className="runner-logo">
              <Image
                src="/sflogotrans.png"
                alt="SF Logo"
                width={60}
                height={60}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Hero Section */}
          <div style={{ textAlign: "center", maxWidth: "700px", width: "100%" }}>
            <h1 className="hero-title orange-text" style={{ marginBottom: "1rem" }}>
              {formName || "SF Coaching"}
            </h1>
            <p className="hero-description">
              {resolvedIntroText}
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isSubmitting}
            className="btn-glass btn-glass-primary liquid-shine"
            style={{
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              padding: "1rem 2.5rem",
              fontSize: "1.125rem",
              fontWeight: "600",
              minWidth: "200px",
            }}
          >
            {isSubmitting ? "Starting..." : "3-2-1-Go"}
          </button>

          {error && (
            <p style={{ color: "#f5576c", fontSize: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (state === "question" && currentQuestion) {
    // Calculate progress percentage (rough estimate based on stepIndex)
    const progressPercent = totalQuestions > 0 
      ? Math.min(100, ((stepIndex + 1) / totalQuestions) * 100)
      : 0;

    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem 1rem",
            maxWidth: "800px",
            margin: "0 auto",
            gap: "2rem",
          }}
        >
          {/* Header with Logo */}
          <div className="runner-header">
            <div className="runner-logo">
              <Image
                src="/sflogotrans.png"
                alt="SF Logo"
                width={60}
                height={60}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div
            className="glass-card-prominent fade-in-up"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: "1.5rem",
            }}
          >
            {/* Progress Bar */}
            <div className="glass-progress-bar" style={{ marginBottom: "0.5rem" }}>
              <div
                className="glass-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Section Title (supports manual line breaks; "\n" or actual newlines) */}
            {(() => {
              const rawTitle = currentQuestion.renderedTitle ?? currentQuestion.title;
              const displayTitle = rawTitle.replace(/\\n/g, "\n");
              return (
            <h2
              className="form-section-title"
              style={{ whiteSpace: "pre-line" }}
            >
              {displayTitle}
            </h2>
              );
            })()}

            {(currentQuestion.renderedHelpText ?? currentQuestion.helpText) && (
              <p className="text-secondary" style={{ fontSize: "1rem", margin: 0, marginTop: "-1rem" }}>
                {currentQuestion.renderedHelpText ?? currentQuestion.helpText}
              </p>
            )}

            {error && (
              <p style={{ color: "#f5576c", fontSize: "0.9rem", margin: 0 }}>
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
                gap: "1.5rem",
              }}
            >
              {renderInput()}

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "0.5rem",
                  flexDirection: currentQuestion.type === "instruction" ? "row-reverse" : "row",
                }}
              >
                {currentQuestion.type !== "instruction" && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting || stepIndex === 0}
                    className="btn-glass btn-glass-outline"
                    style={{
                      cursor: stepIndex === 0 || isSubmitting ? "not-allowed" : "pointer",
                      opacity: stepIndex === 0 || isSubmitting ? 0.6 : 1,
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glass btn-glass-primary liquid-shine"
                  style={{
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                    flex: currentQuestion.type === "instruction" ? 1 : undefined,
                    width: currentQuestion.type === "instruction" ? "100%" : undefined,
                    padding: "1rem 2.5rem",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (state === "completed") {
    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="glass-card-prominent fade-in-up"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <h1 className="gradient-text" style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
            {resolvedCompletionTitle}
          </h1>
          <p className="text-secondary" style={{ fontSize: "1rem" }}>
            {resolvedCompletionMessage}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
