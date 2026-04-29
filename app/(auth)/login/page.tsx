"use client";

import * as React from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faShield } from "@fortawesome/free-solid-svg-icons";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);

    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(SITE_KEY, { action: "login" });

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            recaptcha_token: token,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || "Login failed. Please try again.");
          setLoading(false);
          return;
        }

        // Store JWT and user info
        localStorage.setItem("sms_token", data.access_token);
        localStorage.setItem("sms_refresh_token", data.refresh_token);
        localStorage.setItem("sms_user", JSON.stringify(data.user));

        router.push("/");
      } catch {
        setError("Network error. Please check your connection and try again.");
        setLoading(false);
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
        strategy="afterInteractive"
      />
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
          {/* Grid pattern overlay */}
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
              src="/logo.png"
              alt="KDIAE"
              width={90}
              height={90}
              className="rounded-full object-contain"
            />
          </div>
        </div>

        <CardContent className="px-8 pb-6 pt-0">
          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-[22px] font-bold text-[#212529]">Welcome back</h1>
            <p className="text-[13px] text-slate-400 mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#212529]">E-Mail Address</label>
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

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#212529]">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="• • • • • • • •"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(!!v)}
                  className="border-slate-300"
                />
                <span className="text-[13px] text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[13px] text-slate-600 underline underline-offset-2 hover:text-[#007BFF] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 text-[14px] font-semibold cursor-pointer rounded-lg mt-1"
              style={{ background: "#007BFF", color: "#fff" }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            {/* reCAPTCHA notice */}
            <p className="text-center text-[10.5px] text-slate-400 leading-snug">
              <FontAwesomeIcon icon={faShield} className="w-2.5 mr-1 text-slate-300" />
              Protected by reCAPTCHA &mdash;{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">Privacy</a>
              {" · "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">Terms</a>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs mt-5">
        Having trouble?{" "}
        <a href="mailto:admin@kdiae.edu.pk" className="text-[#007BFF] hover:underline">
          Contact support
        </a>
      </p>
    </div>
  );
}