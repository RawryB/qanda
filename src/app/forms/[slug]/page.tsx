"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

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
type RunnerCssVars = React.CSSProperties & {
  "--accent": string;
  "--accent-contrast": string;
  "--runner-text-primary": string;
  "--runner-text-muted": string;
  "--runner-font-primary": string;
  "--runner-font-secondary": string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getLuminance(hex: string) {
  const clean = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return 0;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const toLinear = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GOOGLE_FONT_OPTIONS = new Set([
  "Syne",
  "DM Sans",
  "Inter",
  "Lora",
  "Merriweather",
  "Montserrat",
  "Poppins",
  "Manrope",
  "Plus Jakarta Sans",
  "Playfair Display",
]);

function sanitizeFont(font: string, fallback: string) {
  return GOOGLE_FONT_OPTIONS.has(font) ? font : fallback;
}

export default function FormsRunnerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isPreview = searchParams.get("preview") === "1";

  const [state, setState] = useState<FormState>("loading");
  const [formName, setFormName] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>("#0D0D0D");
  const [accentColor, setAccentColor] = useState<string>("#4A4744");
  const [transitionColor, setTransitionColor] = useState<string | null>(null);
  const [primaryFont, setPrimaryFont] = useState<string>("Syne");
  const [secondaryFont, setSecondaryFont] = useState<string>("DM Sans");
  const [introText, setIntroText] = useState<string | null>(null);
  const [completionTitle, setCompletionTitle] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedPrimaryFont = sanitizeFont(primaryFont, "Syne");
  const resolvedSecondaryFont = sanitizeFont(secondaryFont, "DM Sans");

  const resolvedIntroText =
    introText ||
    "Thanks for your interest. Answering these questions helps us understand your needs and follow up quickly.";
  const resolvedCompletionTitle = completionTitle || "Done";
  const resolvedCompletionMessage = completionMessage || "Thank you for your submission!";

  const primaryLuminance = useMemo(() => getLuminance(primaryColor), [primaryColor]);
  const accentLuminance = useMemo(() => getLuminance(accentColor), [accentColor]);
  const isLightPrimary = primaryLuminance > 0.35;
  const textPrimary = isLightPrimary ? "#1A1209" : "#F5F2ED";
  const textMuted = isLightPrimary ? "rgba(26,18,9,0.5)" : "rgba(245,242,237,0.55)";
  const progressTrack = isLightPrimary ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const neutralChoiceBg = isLightPrimary ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)";
  const neutralChoiceBorder = isLightPrimary ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)";
  const selectedChoiceBg = hexToRgba(accentColor, isLightPrimary ? 0.12 : 0.15);
  const backButtonColor = isLightPrimary ? "rgba(26,18,9,0.35)" : "rgba(245,242,237,0.35)";
  const accentContrast = accentLuminance > 0.45 ? "#1A1209" : "#F5F2ED";

  useEffect(() => {
    const fetchFormName = async () => {
      try {
        const response = await fetch(`/api/forms/public/form-info?slug=${slug}${isPreview ? "&preview=1" : ""}`);
        if (response.ok) {
          const data = await response.json();
          setFormName(data.name);
          setIntroText(data.introText ?? null);
          setCompletionTitle(data.completionTitle ?? null);
          setCompletionMessage(data.completionMessage ?? null);
          if (typeof data.primaryColor === "string") setPrimaryColor(data.primaryColor);
          if (typeof data.accentColor === "string") setAccentColor(data.accentColor);
          if (typeof data.transitionColor === "string") setTransitionColor(data.transitionColor);
          if (typeof data.primaryFont === "string") setPrimaryFont(data.primaryFont);
          if (typeof data.secondaryFont === "string") setSecondaryFont(data.secondaryFont);
          if (typeof data.logoUrl === "string") setLogoUrl(data.logoUrl);
        } else {
          setError("Form not found or not published");
        }
      } catch {
        setError("Failed to load form");
      }
      setState("start");
    };
    if (slug) fetchFormName();
  }, [slug, isPreview]);

  useEffect(() => {
    const families = Array.from(
      new Set([resolvedPrimaryFont, resolvedSecondaryFont]),
    ).map((font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;700;800`);
    const href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;

    const existing = document.getElementById("qanda-runner-google-fonts");
    if (existing) existing.remove();

    const link = document.createElement("link");
    link.id = "qanda-runner-google-fonts";
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);

    return () => {
      const current = document.getElementById("qanda-runner-google-fonts");
      if (current) current.remove();
    };
  }, [resolvedPrimaryFont, resolvedSecondaryFont]);

  const handleStart = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/forms/public/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, preview: isPreview }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start form");
      setSubmissionId(data.submissionId);
      if (data.form?.name) setFormName(data.form.name);
      if (data.form?.backgroundImageUrl) setBackgroundImageUrl(data.form.backgroundImageUrl);
      if (data.form?.introText !== undefined) setIntroText(data.form.introText ?? null);
      if (data.form?.completionTitle !== undefined) setCompletionTitle(data.form.completionTitle ?? null);
      if (data.form?.completionMessage !== undefined) setCompletionMessage(data.form.completionMessage ?? null);
      if (typeof data.form?.primaryColor === "string") setPrimaryColor(data.form.primaryColor);
      if (typeof data.form?.accentColor === "string") setAccentColor(data.form.accentColor);
      if (typeof data.form?.transitionColor === "string") setTransitionColor(data.form.transitionColor);
      if (typeof data.form?.primaryFont === "string") setPrimaryFont(data.form.primaryFont);
      if (typeof data.form?.secondaryFont === "string") setSecondaryFont(data.form.secondaryFont);
      if (typeof data.form?.logoUrl === "string") setLogoUrl(data.form.logoUrl);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
      setCurrentQuestion(data.question);
      setStepIndex(data.stepIndex ?? 0);
      setState("question");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to start form"));
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
      if (!response.ok) throw new Error(data.error || "Failed to save answer");
      if (data.completed) {
        setState("completed");
        if (data.redirectUrl) window.location.href = data.redirectUrl;
      } else {
        setCurrentQuestion(data.nextQuestion);
        setStepIndex(data.stepIndex ?? stepIndex + 1);
        if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
        setAnswer("");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save answer"));
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
      if (!response.ok) throw new Error(data.error || "Failed to go back");
      if (data.atStart) return;
      setCurrentQuestion(data.question);
      setStepIndex(data.stepIndex);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
      if (data.existingAnswer) {
        const v = data.existingAnswer.valueText || data.existingAnswer.valueJson || "";
        if (data.question.type === "yesno") {
          if (v === true || v === "true") setAnswer("yes");
          else if (v === false || v === "false") setAnswer("no");
          else setAnswer(v);
        } else {
          setAnswer(v);
        }
      } else {
        setAnswer("");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to go back"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    if (!currentQuestion) return null;
    if (currentQuestion.type === "instruction") return null;

    if (currentQuestion.type === "text" || currentQuestion.type === "email" || currentQuestion.type === "phone") {
      return (
        <input
          type={currentQuestion.type === "email" ? "email" : currentQuestion.type === "phone" ? "tel" : "text"}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required={currentQuestion.required}
          className="w-full rounded-[8px] border px-4 py-3 text-[14px] outline-none"
          style={{
            background: neutralChoiceBg,
            borderColor: neutralChoiceBorder,
            color: textPrimary,
            fontFamily: "var(--runner-font-secondary)",
          }}
        />
      );
    }

    if (currentQuestion.type === "yesno" || currentQuestion.type === "multi") {
      const options =
        currentQuestion.type === "yesno"
          ? [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]
          : currentQuestion.choices || [];
      return (
        <div className="grid gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-[8px] border px-4 py-3"
              style={
                answer === option.value
                  ? {
                      background: selectedChoiceBg,
                      borderColor: accentColor,
                    }
                  : {
                      background: neutralChoiceBg,
                      borderColor: neutralChoiceBorder,
                    }
              }
            >
              <input
                type="radio"
                name="choice"
                value={option.value}
                checked={answer === option.value}
                onChange={(e) => setAnswer(e.target.value)}
                required={currentQuestion.required}
                style={{ accentColor }}
              />
              <span
                className="type-body-md"
                style={{
                  fontFamily: "var(--runner-font-secondary)",
                  color: answer === option.value ? textPrimary : textMuted,
                }}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      );
    }

    if (currentQuestion.type === "dropdown") {
      return (
        <select
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required={currentQuestion.required}
          className="w-full rounded-[8px] border px-4 py-3 text-[14px] outline-none"
          style={{
            background: neutralChoiceBg,
            borderColor: neutralChoiceBorder,
            color: textPrimary,
            fontFamily: "var(--runner-font-secondary)",
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
    }

    return null;
  };

  const shellStyle: RunnerCssVars = {
    minHeight: "100vh",
    background: transitionColor
      ? `linear-gradient(135deg, ${primaryColor} 0%, ${transitionColor} 100%)`
      : primaryColor,
    ...(backgroundImageUrl
      ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center center" }
      : {}),
    "--accent": accentColor,
    "--accent-contrast": accentContrast,
    "--runner-text-primary": textPrimary,
    "--runner-text-muted": textMuted,
    "--runner-font-primary": `'${resolvedPrimaryFont}', var(--font-syne), sans-serif`,
    "--runner-font-secondary": `'${resolvedSecondaryFont}', var(--font-dm-sans), sans-serif`,
  };

  if (state === "loading") {
    return (
      <div style={shellStyle} className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {backgroundImageUrl && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                filter: "blur(4px)",
                transform: "scale(1.05)",
                zIndex: 0,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: hexToRgba(primaryColor, 0.54), zIndex: 1 }}
            />
          </>
        )}
        <p className="relative z-10 type-body-md" style={{ color: textPrimary }}>Loading...</p>
      </div>
    );
  }

  if (state === "start") {
    return (
      <div style={shellStyle} className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        {backgroundImageUrl && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                filter: "blur(4px)",
                transform: "scale(1.05)",
                zIndex: 0,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: hexToRgba(primaryColor, 0.54), zIndex: 1 }}
            />
          </>
        )}
        <section
          className="relative z-10 flex w-full max-w-[760px] flex-col items-center gap-6 px-8 py-10 text-center"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Form logo" className="h-[56px] w-auto object-contain" />
          ) : (
            <div className="type-heading-md" style={{ fontFamily: "var(--runner-font-primary)" }}>
              Q<span style={{ color: "var(--accent)" }}>&amp;</span>A
            </div>
          )}
          <h1 className="type-display-md m-0" style={{ fontFamily: "var(--runner-font-primary)", color: textPrimary }}>{formName || "Application"}</h1>
          <p className="type-body-md m-0" style={{ fontFamily: "var(--runner-font-secondary)", color: textMuted }}>{resolvedIntroText}</p>
          <Button variant="accent" onClick={handleStart} disabled={isSubmitting} className="min-w-[220px]">
            {isSubmitting ? "Starting..." : "Start"}
          </Button>
          {error && <p className="m-0 text-[var(--danger-fg)]">{error}</p>}
        </section>
      </div>
    );
  }

  if (state === "question" && currentQuestion) {
    const progressPercent = totalQuestions > 0 ? Math.min(100, ((stepIndex + 1) / totalQuestions) * 100) : 0;
    const rawTitle = currentQuestion.renderedTitle ?? currentQuestion.title;
    const displayTitle = rawTitle.replace(/\\n/g, "\n");

    return (
      <div style={shellStyle} className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        {backgroundImageUrl && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                filter: "blur(4px)",
                transform: "scale(1.05)",
                zIndex: 0,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: hexToRgba(primaryColor, 0.54), zIndex: 1 }}
            />
          </>
        )}
        <section
          className="relative z-10 flex w-full max-w-[620px] flex-col gap-6 px-8 py-8"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="type-label-sm uppercase tracking-[0.1em]" style={{ color: backButtonColor, fontFamily: "var(--runner-font-primary)" }}>
              Question {String(stepIndex + 1).padStart(2, "0")}
            </div>
            <div className="type-label-sm" style={{ color: backButtonColor, fontFamily: "var(--runner-font-secondary)" }}>
              {Math.min(stepIndex + 1, totalQuestions)} of {totalQuestions || "?"}
            </div>
          </div>
          <div className="h-[2px] w-full overflow-hidden rounded-full" style={{ background: progressTrack }}>
            <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-150" style={{ width: `${progressPercent}%` }} />
          </div>

          <h2 className="type-heading-lg m-0 whitespace-pre-line" style={{ fontFamily: "var(--runner-font-primary)", color: textPrimary }}>
            {displayTitle}
          </h2>
          {(currentQuestion.renderedHelpText ?? currentQuestion.helpText) && (
            <p className="type-body-md -mt-3 m-0" style={{ fontFamily: "var(--runner-font-secondary)", color: textMuted }}>
              {currentQuestion.renderedHelpText ?? currentQuestion.helpText}
            </p>
          )}
          {error && <p className="m-0 text-[var(--danger-fg)]">{error}</p>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="flex flex-col gap-6"
          >
            {renderInput()}
            <div className={`flex items-center justify-between gap-3 ${currentQuestion.type === "instruction" ? "flex-row-reverse" : ""}`}>
              {currentQuestion.type !== "instruction" && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting || stepIndex === 0}
                  className="text-[11px] font-bold uppercase tracking-[0.06em] transition-opacity disabled:opacity-30"
                  style={{ color: backButtonColor, fontFamily: "var(--runner-font-primary)" }}
                >
                  ← Back
                </button>
              )}
              <Button type="submit" variant="accent" disabled={isSubmitting} className={currentQuestion.type === "instruction" ? "w-full" : ""}>
                {isSubmitting ? "Saving..." : "Next"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  if (state === "completed") {
    return (
      <div style={shellStyle} className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        {backgroundImageUrl && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                filter: "blur(4px)",
                transform: "scale(1.05)",
                zIndex: 0,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: hexToRgba(primaryColor, 0.54), zIndex: 1 }}
            />
          </>
        )}
        <section
          className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-4 px-8 py-10 text-center"
        >
          <h1 className="type-display-md m-0" style={{ fontFamily: "var(--runner-font-primary)", color: textPrimary }}>{resolvedCompletionTitle}</h1>
          <p className="type-body-md m-0" style={{ fontFamily: "var(--runner-font-secondary)", color: textMuted }}>
            {resolvedCompletionMessage}
          </p>
        </section>
      </div>
    );
  }

  return null;
}
