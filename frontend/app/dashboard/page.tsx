"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken, getUser, clearAuth } from "@/lib/api";

const PAGE_SIZE = 10;

export type Student = {
  _id: string;
  fullName: string;
  studentId: string;
  email: string;
  grade?: string;
  enrollmentDate?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    grade: "",
    enrollmentDate: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const user = getUser();

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = s.fullName.toLowerCase();
      const id = s.studentId.toLowerCase();
      const email = s.email.toLowerCase();
      const grade = (s.grade || "").toLowerCase();
      return (
        name.startsWith(q) ||
        id.startsWith(q) ||
        email.startsWith(q) ||
        grade.startsWith(q)
      );
    });
  }, [students, searchQuery]);

  const totalCount = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageIndex = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedStudents = useMemo(() => {
    const start = (pageIndex - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, pageIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    loadStudents();
  }, [router]);

  async function loadStudents() {
    try {
      setLoading(true);
      setError(null);
      const res = await api("/api/students");
      if (res.status === 401) {
        clearAuth();
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      setStudents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ fullName: "", studentId: "", email: "", grade: "", enrollmentDate: "" });
    setFormError(null);
    setModal("add");
  }

  function openEdit(s: Student) {
    setEditing(s);
    setForm({
      fullName: s.fullName,
      studentId: s.studentId,
      email: s.email,
      grade: s.grade || "",
      enrollmentDate: s.enrollmentDate ? s.enrollmentDate.slice(0, 10) : "",
    });
    setFormError(null);
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.fullName.trim() || !form.studentId.trim() || !form.email.trim()) {
      setFormError("Full name, Student ID and Email are required.");
      return;
    }
    try {
      setSubmitLoading(true);
      if (modal === "add") {
        const res = await api("/api/students", {
          method: "POST",
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            studentId: form.studentId.trim(),
            email: form.email.trim(),
            grade: form.grade.trim() || undefined,
            enrollmentDate: form.enrollmentDate || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Failed to add student");
        }
        await loadStudents();
        setModal(null);
      } else if (modal === "edit" && editing) {
        const res = await api(`/api/students/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            studentId: form.studentId.trim(),
            email: form.email.trim(),
            grade: form.grade.trim() || undefined,
            enrollmentDate: form.enrollmentDate || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Failed to update student");
        }
        await loadStudents();
        setModal(null);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(s: Student) {
    if (!confirm(`Delete student "${s.fullName}"?`)) return;
    try {
      const res = await api(`/api/students/${s._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Student Management</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-stone-600 hover:text-stone-900 font-medium">
              Dashboard
            </Link>
            <Link href="/profile" className="text-stone-600 hover:text-stone-900 font-medium">
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Students</h2>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800"
          >
            Add Student
          </button>
        </div>

        {!loading && students.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, student ID, email or grade..."
              className="w-full max-w-md h-11 px-4 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-stone-500">No students yet. Add one to get started.</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-stone-500">No students match your search.</p>
        ) : (
          <>
            <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="p-4 font-medium">Full Name</th>
                    <th className="p-4 font-medium">Student ID</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Grade</th>
                    <th className="p-4 font-medium">Enrollment Date</th>
                    <th className="p-4 font-medium w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s) => (
                    <tr key={s._id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="p-4">{s.fullName}</td>
                      <td className="p-4">{s.studentId}</td>
                      <td className="p-4">{s.email}</td>
                      <td className="p-4">{s.grade || "—"}</td>
                      <td className="p-4">
                        {s.enrollmentDate
                          ? new Date(s.enrollmentDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-stone-500">
                Showing {(pageIndex - 1) * PAGE_SIZE + 1}–
                {Math.min(pageIndex * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pageIndex <= 1}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100"
                >
                  Previous
                </button>
                <span className="text-sm text-stone-600 px-2">
                  Page {pageIndex} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageIndex >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {modal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-10 p-4"
          onClick={() => !submitLoading && setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {modal === "add" ? "Add Student" : "Edit Student"}
            </h3>
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Full name"
                className="w-full h-11 px-4 border border-stone-300 rounded-lg"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
              <input
                placeholder="Student ID"
                className="w-full h-11 px-4 border border-stone-300 rounded-lg"
                value={form.studentId}
                onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full h-11 px-4 border border-stone-300 rounded-lg"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <input
                placeholder="Grade"
                className="w-full h-11 px-4 border border-stone-300 rounded-lg"
                value={form.grade}
                onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              />
              <input
                type="date"
                placeholder="Enrollment date"
                className="w-full h-11 px-4 border border-stone-300 rounded-lg"
                value={form.enrollmentDate}
                onChange={(e) => setForm((f) => ({ ...f, enrollmentDate: e.target.value }))}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !submitLoading && setModal(null)}
                  className="flex-1 py-2 rounded-lg border border-stone-300 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : modal === "add" ? "Add" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
