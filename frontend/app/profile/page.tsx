"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken, getUser, clearAuth } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const user = getUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [router, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password.length > 0 && password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    try {
      setLoading(true);
      const body: { fullName?: string; email?: string; password?: string } = {
        fullName: fullName.trim(),
        email: email.trim(),
      };
      if (password.length > 0) body.password = password;
      const res = await api("/api/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        clearAuth();
        router.push("/");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Update failed");
      setMessage({ type: "success", text: "Profile updated successfully." });
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setPassword("");
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Update failed",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Student Management</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-stone-600 hover:text-stone-900 font-medium">
              Dashboard
            </Link>
            <Link href="/profile" className="text-stone-900 font-medium">
              Profile
            </Link>
          </nav>
        </div>
        <span className="text-sm text-stone-500">{user.email}</span>
      </header>

      <main className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Profile</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-stone-200 rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Full name</label>
            <input
              className="w-full h-11 px-4 border border-stone-300 rounded-lg"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full h-11 px-4 border border-stone-300 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              New password (leave blank to keep current, min 8 characters)
            </label>
            <input
              type="password"
              className="w-full h-11 px-4 border border-stone-300 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
