"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, setAuth, getToken } from "@/lib/api";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  useEffect(() => {
    if (getToken()) router.push("/dashboard");
  }, [router]);
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isRegister = mode === "register";

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (isRegister && (!fullName || password.length < 8)) return false;
    return true;
  }, [email, password, isRegister, fullName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!canSubmit) return;
    if (isRegister && password.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    try {
      setLoading(true);
      const endpoint = isRegister ? "/api/register" : "/api/login";
      const payload = isRegister
        ? { fullName, email, password }
        : { email, password };

      const res = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Request failed");

      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  const primaryBtn =
    "inline-flex items-center justify-center h-11 px-6 rounded-full border-2 border-[#1f2020] text-[#1f2020] text-[12px] tracking-[0.18em] uppercase transition hover:bg-[#1f2020] hover:text-white disabled:opacity-50";

  return (
    <div className="min-h-screen grid place-items-center bg-white text-[#1f2020] px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 border border-black/10 rounded-3xl p-10 shadow-sm">

        <div>
          <h1 className="text-3xl font-semibold">Student Management</h1>
          <p className="mt-4 text-sm opacity-80">
            Login or create an account to manage students, grades and attendance.
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {isRegister ? "Register" : "Login"}
            </h2>

            <div className="flex gap-2">
              <button onClick={() => setMode("login")} className="text-sm underline cursor-pointer">
                Login
              </button>
              <button onClick={() => setMode("register")} className="text-sm underline cursor-pointer">
                Register
              </button>
            </div>
          </div>

          {msg && (
            <div className="mb-4 text-sm text-red-600">
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                placeholder="Full name"
                className="w-full h-11 px-4 border rounded-xl"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <input
              placeholder="Email"
              type="email"
              className="w-full h-11 px-4 border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <input
                placeholder={isRegister ? "Password (at least 8 characters)" : "Password"}
                type="password"
                className="w-full h-11 px-4 border rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={isRegister ? 8 : undefined}
              />
              {isRegister && (
                <p className="mt-1 text-xs text-stone-500">Minimum 8 characters</p>
              )}
            </div>

            <button className={`${primaryBtn} cursor-pointer`} disabled={!canSubmit || loading}>
              {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
