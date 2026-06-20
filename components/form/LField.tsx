"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

// ── Helpers ────────────────────────────────────────────────────────────────
const digitCount = (v: string) => v.replace(/\D/g, "").length;

/** Allow only digits / + / - / space / parentheses; cap at 10 actual digits. */
function filterTel(raw: string): string {
  const allowed = raw.replace(/[^\d\s\-()+]/g, "");
  let digits = 0;
  let out = "";
  for (const ch of allowed) {
    if (/\d/.test(ch)) {
      if (digits >= 10) continue;
      digits++;
    }
    out += ch;
  }
  return out;
}

const TEL_ERROR   = "Enter a valid 10-digit mobile number";
const EMAIL_ERROR = "Enter a valid email address";
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Component ──────────────────────────────────────────────────────────────
export function LField({
  label,
  field,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error: externalError,
}: {
  label: string;
  field: string;
  value: string | number;
  onChange: (f: string, v: string) => void;
  placeholder?: string;
  /** "tel"   → digit-only filter + 10-digit validation
   *  "email" → email format validation on blur
   *  "text"  → no extra validation (default) */
  type?: "text" | "tel" | "email";
  /** External error shown immediately without requiring blur */
  error?: string;
}) {
  const [touched, setTouched] = useState(false);
  const strVal = String(value ?? "");

  let internalError = "";
  if (touched && strVal) {
    if (type === "tel"   && digitCount(strVal) !== 10) internalError = TEL_ERROR;
    if (type === "email" && !EMAIL_RE.test(strVal))    internalError = EMAIL_ERROR;
  }
  const displayError = externalError ?? internalError;

  function handleChange(raw: string) {
    onChange(field, type === "tel" ? filterTel(raw) : raw);
  }

  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
        {label}
      </label>
      <Input
        type={type === "email" ? "email" : type === "tel" ? "tel" : "text"}
        inputMode={type === "tel" ? "numeric" : undefined}
        placeholder={placeholder}
        value={strVal}
        maxLength={type === "tel" ? 14 : undefined}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTouched(true)}
        onClick={(e) => e.stopPropagation()}
        className={[
          "h-8 text-[13px] bg-white border-slate-200",
          displayError ? "!border-red-400 focus-visible:!ring-red-300" : "",
        ].join(" ")}
      />
      {displayError && (
        <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{displayError}</p>
      )}
    </div>
  );
}
