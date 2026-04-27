"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    // Simulate auth — replace with real auth logic
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        router.push("/");
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 800);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 text-white"
        style={{ background: "#212529" }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="KDIAE Logo" width={40} height={40} className="rounded-lg" />
          <span className="font-semibold text-lg tracking-tight">KDIAE Admin</span>
        </div>

        {/* Center copy */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            School Management<br />System
          </h1>
          <p className="text-sm" style={{ color: "#adb5bd" }}>
            Manage students, staff, attendance, fees, academics, and more —
            all from one place.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {[
              "Student & teacher management",
              "Attendance tracking",
              "Fee collection & reports",
              "Timetable & exam scheduling",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{ background: "#FFCA2B", color: "#212529" }}
                >
                  ✓
                </span>
                <span style={{ color: "#ced4da" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: "#6c757d" }}>
          © {new Date().getFullYear()} KD Institute of Advanced Education
        </p>
      </div>

      {/* Right panel */}
      <div
        className="relative flex-1 flex items-center justify-center p-6"
        style={{
          backgroundImage: "url('/gal_1774722812_d7048d8e.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(1px)" }} />
        <div className="relative z-10 w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <Image src="/logo.png" alt="KDIAE Logo" width={40} height={40} className="rounded-lg" />
            <span className="font-semibold text-lg tracking-tight text-white">KDIAE Admin</span>
          </div>


          <Card className="shadow-lg border-white/10" style={{ background: "rgba(15,17,20,0.65)", backdropFilter: "blur(12px)" }}>
            <CardContent>
              <div className="space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                <p className="text-sm text-white/70">Sign in to your admin account</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-white/80"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#007BFF] mt-2"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white/80"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#007BFF] mt-2"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-300 bg-red-500/20 border border-red-500/30 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full font-semibold cursor-pointer"
                  style={{ background: "#007BFF", color: "#fff" }}
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-white/60">
            Having trouble?{" "}
            <a href="mailto:admin@kdiae.edu.pk" className="text-[#FFCA2B] hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
