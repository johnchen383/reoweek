import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { haptics } from "../utils/haptics";
import type { AnswerValue, SurveyAnswer, SurveyQuestion } from "../types";

interface SurveyProps {
  questions: SurveyQuestion[];
  /** Called with all answers when the last question is submitted. May throw to keep the user on the form. */
  onComplete: (answers: SurveyAnswer[]) => Promise<void>;
}

const LETTERS = "ABCDEFGHIJ";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
// 8–15 digits, optional leading +, ignoring spaces/dashes/parentheses.
const PHONE_RE = /^\+?\d{8,15}$/;

const TEXT_LIKE = ["text", "email", "phone"] as const;

const INPUT_ATTRS = {
  text: { type: "text", inputMode: undefined, autoComplete: "name" },
  email: { type: "email", inputMode: "email", autoComplete: "email" },
  phone: { type: "tel", inputMode: "tel", autoComplete: "tel" },
} as const;

function validationError(question: SurveyQuestion, answer: string) {
  if (question.type === "email" && !EMAIL_RE.test(answer.trim())) {
    return "Hmm, that email doesn’t look right";
  }
  if (
    question.type === "phone" &&
    !PHONE_RE.test(answer.replace(/[\s\-().]/g, ""))
  ) {
    return "Hmm, that number doesn’t look right";
  }
  return null;
}

/**
 * A Typeform-style, one-question-at-a-time survey. Enter advances, choices
 * and scales auto-advance on selection, and the thin bar up top tracks
 * progress.
 */
export function Survey({ questions, onComplete }: SurveyProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const advanceTimer = useRef<number | undefined>(undefined);

  const question = questions[index];
  const value = answers[question.id];
  const isLast = index === questions.length - 1;
  // Single-line input attributes when this is a text-like question (text/email/phone).
  const textAttrs = (TEXT_LIKE as readonly string[]).includes(question.type)
    ? INPUT_ATTRS[question.type as (typeof TEXT_LIKE)[number]]
    : null;

  useEffect(() => {
    inputRef.current?.focus();
    // Keep the field visible when the on-screen keyboard is open.
    inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    return () => window.clearTimeout(advanceTimer.current);
  }, [index]);

  function setAnswer(id: string, answer: AnswerValue) {
    setError(null);
    setAnswers((prev) => ({ ...prev, [id]: answer }));
  }

  function isEmpty(answer: AnswerValue | undefined) {
    return (
      answer === undefined ||
      (typeof answer === "string" && answer.trim() === "") ||
      (Array.isArray(answer) && answer.length === 0)
    );
  }

  async function next(currentAnswers = answers) {
    const answer = currentAnswers[question.id];
    const empty = isEmpty(answer);
    if (question.required && empty) {
      setError("Please fill in this field!");
      return;
    }
    if (!empty && typeof answer === "string") {
      const invalid = validationError(question, answer);
      if (invalid) {
        setError(invalid);
        return;
      }
    }

    if (!isLast) {
      setError(null);
      setIndex(index + 1);
      return;
    }

    // Last question — build the answer list and hand it to the parent.
    const built: SurveyAnswer[] = questions
      .filter((q) => !isEmpty(currentAnswers[q.id]))
      .map((q) => ({
        questionId: q.id,
        question: q.question,
        subLabel: q.subLabel,
        answer: currentAnswers[q.id],
      }));

    setSubmitting(true);
    setError(null);
    try {
      await onComplete(built);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong — try again",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /** Toggle one selection of a multichoice question — no auto-advance. */
  function toggleOption(option: string) {
    if (submitting) return;
    haptics.tick();
    const current = Array.isArray(value) ? value : [];
    setAnswer(
      question.id,
      current.includes(option)
        ? current.filter((o) => o !== option)
        : option === "I'm not interested in anything at the moment"
          ? [option]
          : [
              ...current.filter(
                (o) => o !== "I'm not interested in anything at the moment",
              ),
              option,
            ],
    );
  }

  /** Select an option, show it highlighted briefly, then advance. */
  function selectAndAdvance(answer: string | number) {
    if (submitting) return;
    haptics.tick();
    setAnswer(question.id, answer);
    window.clearTimeout(advanceTimer.current);
    const updated = { ...answers, [question.id]: answer };
    advanceTimer.current = window.setTimeout(() => next(updated), 350);
  }

  function back() {
    if (index > 0 && !submitting) {
      setError(null);
      setIndex(index - 1);
    }
  }

  return (
    <div className="survey">
      <div className="survey__progress-track" aria-hidden="true">
        <div
          className="survey__progress-fill"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <div className="survey__question" key={question.id}>
        <div className="survey__counter">
          {index + 1} <span className="survey__arrow">→</span>
        </div>
        <h2 className="survey__title">
          {question.question}
          {question.required && <span className="survey__required"></span>}
        </h2>
        {question.subLabel && (
          <p className="survey__sub-label">{question.subLabel}</p>
        )}

        {textAttrs && (
          <input
            ref={inputRef as RefObject<HTMLInputElement>}
            className="survey__input"
            type={textAttrs.type}
            inputMode={textAttrs.inputMode}
            autoComplete={textAttrs.autoComplete}
            placeholder={question.placeholder ?? "Type your answer…"}
            value={(value as string) ?? ""}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") next();
            }}
          />
        )}

        {question.type === "longtext" && (
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            className="survey__input survey__input--area"
            rows={3}
            placeholder={question.placeholder ?? "Type your answer…"}
            value={(value as string) ?? ""}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                next();
              }
            }}
          />
        )}

        {question.type === "choice" && (
          <div className="survey__options">
            {question.options?.map((option, i) => (
              <button
                key={option}
                type="button"
                className={`survey__option${value === option ? " survey__option--selected" : ""}`}
                onClick={() => selectAndAdvance(option)}>
                <span className="survey__option-key">{LETTERS[i]}</span>
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "multichoice" && (
          <div className="survey__options">
            <p className="survey__multi-hint">Choose all that apply</p>
            {question.options?.map((option, i) => {
              const selected = Array.isArray(value) && value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={`survey__option${selected ? " survey__option--selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleOption(option)}>
                  <span className="survey__option-key">
                    {selected ? "✓" : LETTERS[i]}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "scale" && (
          <div className="survey__scale">
            <div className="survey__scale-buttons">
              {Array.from(
                { length: (question.max ?? 5) - (question.min ?? 1) + 1 },
                (_, i) => (question.min ?? 1) + i,
              ).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`survey__scale-btn${value === n ? " survey__scale-btn--selected" : ""}`}
                  onClick={() => selectAndAdvance(n)}>
                  {n}
                </button>
              ))}
            </div>
            {(question.minLabel || question.maxLabel) && (
              <div className="survey__scale-labels">
                <span>{question.minLabel}</span>
                <span>{question.maxLabel}</span>
              </div>
            )}
          </div>
        )}

        {error && <p className="survey__error">{error}</p>}

        <div className="survey__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => next()}
            disabled={submitting}>
            {submitting ? "Saving…" : isLast ? "Submit" : "OK"}
          </button>
          {/* {(textAttrs || question.type === "longtext") && !submitting && (
            <span className="survey__enter-hint">
              press <strong>Enter ↵</strong>
            </span>
          )} */}
        </div>
      </div>

      {index > 0 && (
        <button
          type="button"
          className="survey__back"
          onClick={back}
          disabled={submitting}>
          ↑ Back
        </button>
      )}
    </div>
  );
}
