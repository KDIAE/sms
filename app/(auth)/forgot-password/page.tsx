"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

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
          {sent ? (
            <div className="text-center py-6 flex flex-col items-center gap-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="w-12 h-12 text-green-500"
              />
              <div>
                <h2 className="text-[18px] font-bold text-[#212529]">Check your inbox</h2>
                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                  If <span className="font-medium text-slate-700">{email}</span> is registered, you&apos;ll
                  receive a reset link shortly. Check your spam folder if it doesn&apos;t arrive.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 text-[13px] text-[#007BFF] hover:underline flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7 mt-6">
                <h1 className="text-[22px] font-bold text-[#212529]">Forgot password?</h1>
                <p className="text-[13px] text-slate-400 mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#212529]">
                    E-Mail Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    className="h-11 text-[13.5px] border-slate-200 placeholder:text-slate-400 focus-visible:ring-[#007BFF]"
                  />
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
                  {loading ? "Sending…" : "Send reset link"}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
