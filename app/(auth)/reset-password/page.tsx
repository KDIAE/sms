"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCheckCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-6 flex flex-col items-center gap-4">
        <FontAwesomeIcon icon={faCheckCircle} className="w-12 h-12 text-green-500" />
        <div>
          <h2 className="text-[18px] font-bold text-[#212529]">Password updated!</h2>
          <p className="text-[13px] text-slate-500 mt-1">
            Redirecting you to login…
          </p>
        </div>
        <Link
          href="/login"
          className="text-[13px] text-[#007BFF] hover:underline flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-7 mt-6">
        <h1 className="text-[22px] font-bold text-[#212529]">Set new password</h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#212529]">New Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="h-11 pr-10 text-[13.5px] border-slate-200 placeholder:text-slate-400 focus-visible:ring-[#007BFF]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#212529]">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="h-11 pr-10 text-[13.5px] border-slate-200 placeholder:text-slate-400 focus-visible:ring-[#007BFF]"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={showConfirm ? faEye : faEyeSlash} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-[14px] font-semibold cursor-pointer rounded-lg mt-1"
          style={{ background: "#007BFF", color: "#fff" }}
          disabled={loading}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>

        <Link
          href="/login"
          className="text-center text-[13px] text-slate-500 hover:text-[#007BFF] transition-colors flex items-center justify-center gap-1.5"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
          Back to login
        </Link>
      </form>
    </>
  );
}

function InvalidToken() {
  return (
    <div className="text-center py-6 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-500 text-xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-[18px] font-bold text-[#212529]">Invalid link</h2>
        <p className="text-[13px] text-slate-500 mt-1">
          This reset link is missing or invalid. Please request a new one.
        </p>
      </div>
      <Link
        href="/forgot-password"
        className="text-[13px] text-[#007BFF] hover:underline"
      >
        Request new reset link
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <Card
        className="w-full max-w-[420px] bg-white rounded-2xl overflow-hidden p-0 ring-1 ring-border border-white"
        style={{
          boxShadow: "inset 0 0 0 6px rgba(255,255,255,0.95), 0 1px 4px 0 rgb(0 0 0 / 0.07)",
          outline: "6px solid rgba(255,255,255,0.95)",
        }}
      >
        {/* Top gradient area */}
        <div
          className="flex justify-center pt-10 pb-0 relative"
          style={{
            background:
              "radial-gradient(ellipse 80% 120% at 50% -10%, #7E87A335 0%, #7E87A308 55%, transparent 80%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#7E87A322 1px, transparent 1px), linear-gradient(90deg, #7E87A345 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative w-18 h-18 rounded-full flex items-center justify-center">
            <Image
              src="https://cdn.kdiae.in/logo.png"
              alt="KDIAE"
              width={90}
              height={90}
              className="rounded-full object-contain"
            />
          </div>
        </div>

        <CardContent className="px-8 pb-6 pt-0">
          {token ? <ResetPasswordForm token={token} /> : <InvalidToken />}
        </CardContent>
      </Card>
    </div>
  );
}
