```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          workspaceName,
        }),
      });

      if (!res.ok) {
           const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="flex min-h-screen">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-[46%]">
          {/* Background decoration */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-950">
                  W
                </div>

                <span className="text-xl font-semibold tracking-tight text-white">
                  Workspace
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                ✦ Built for modern teams
              </div>

              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Everything your team needs,
                <span className="text-indigo-400"> in one place.</span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Create your workspace, bring your team together, and manage
                your work from a single, beautifully organized place.
              </p>

              {/* Mini dashboard card */}
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      YOUR WORKSPACE
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Product Team
                    </p>
                  </div>

                  <div className="flex -space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-indigo-500 text-xs font-semibold text-white">
                      A
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-xs font-semibold text-white">
                      R
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-orange-500 text-xs font-semibold text-white">
                      S
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="h-2 w-12 rounded-full bg-white/20" />
                    <div className="mt-3 h-2 w-16 rounded-full bg-indigo-400/70" />
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="h-2 w-10 rounded-full bg-white/20" />
                    <div className="mt-3 h-2 w-12 rounded-full bg-emerald-400/70" />
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="h-2 w-14 rounded-full bg-white/20" />
                    <div className="mt-3 h-2 w-8 rounded-full bg-orange-400/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-sm text-slate-500">
              © 2026 Workspace. All rights reserved.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex w-full items-center justify-center px-6 py-10 lg:w-[54%]">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white">
                W
              </div>

              <span className="text-xl font-semibold">
                Workspace
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Create your workspace
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get started by creating your account and setting up your
                workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                <span className="mt-0.5">!</span>
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Your name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Workspace */}
              <div>
                <label
                  htmlFor="workspaceName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Workspace name
                </label>

                <input
                  id="workspaceName"
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme Inc."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

                <p className="mt-2 text-xs text-slate-400">
                  You can change this later from your workspace settings.
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <span className="text-xs text-slate-400">
                    8+ characters
                  </span>
                </div>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Terms */}
              <p className="pt-1 text-xs leading-5 text-slate-500">
                By creating an account, you agree to our{" "}
                <a
                  href="#"
                  className="font-medium text-slate-700 underline underline-offset-2 hover:text-indigo-600"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-slate-700 underline underline-offset-2 hover:text-indigo-600"
                >
                  Privacy Policy
                </a>
                .
              </p>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-indigo-600 hover:shadow-indigo-600/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating workspace...
                  </>
                ) : (
                  <>
                    Create workspace
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-semibold text-slate-900 hover:text-indigo-600"
              >
                Sign in
              </button>
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}
```
