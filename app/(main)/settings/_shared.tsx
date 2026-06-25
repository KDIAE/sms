"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import type { RoleEntry } from "@/lib/api";

// ── RBAC defaults ─────────────────────────────────────────────────────────────

export const PERM_KEYS = [
  "students", "admissions", "classes", "fees", "exams",
  "attendance", "transport", "reports", "announcements", "settings",
];

export const ROLE_OPTIONS = ["admin", "principal", "teacher", "finance"] as const;

export const ROLE_COLORS: Record<string, string> = {
  admin:     "bg-blue-50 text-blue-700 border-blue-200",
  principal: "bg-purple-50 text-purple-700 border-purple-200",
  teacher:   "bg-amber-50 text-amber-700 border-amber-200",
  finance:   "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const ROLES_DEFAULTS: RoleEntry[] = [
  {
    role: "Admin",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    perms: { students: true, admissions: true, classes: true, fees: true, exams: true, attendance: true, transport: true, reports: true, announcements: true, settings: true },
  },
  {
    role: "Principal",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    perms: { students: true, admissions: true, classes: true, fees: false, exams: true, attendance: true, transport: true, reports: true, announcements: true, settings: false },
  },
  {
    role: "Teacher",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    perms: { students: true, admissions: true, classes: true, fees: false, exams: true, attendance: true, transport: false, reports: false, announcements: true, settings: false },
  },
  {
    role: "Finance",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    perms: { students: true, admissions: false, classes: false, fees: true, exams: false, attendance: false, transport: true, reports: true, announcements: false, settings: false },
  },
];

export const NOTIF_SETTINGS = [
  { key: "fee_due",       label: "Fee Due Reminders",           desc: "Send automatic reminders when fees are due."   },
  { key: "attendance",    label: "Daily Attendance Alerts",     desc: "Notify when a student is marked absent."       },
  { key: "exam_schedule", label: "Exam Schedule Notifications", desc: "Alert when exams are scheduled."               },
  { key: "announcements", label: "Announcement Broadcasts",     desc: "Push announcements to portal users instantly." },
  { key: "results",       label: "Results Published Alerts",    desc: "Notify when exam results are published."       },
  { key: "transport",     label: "Transport Delay Alerts",      desc: "Inform of any bus delays or route changes."    },
];

// ── Shared UI components ──────────────────────────────────────────────────────

export type SaveStatusType = "idle" | "saving" | "saved" | "error";

export function SaveStatus({ status }: { status: SaveStatusType }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[11px]" /> Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-emerald-600">
        <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" /> Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-red-600">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-[11px]" /> Failed to save
      </span>
    );
  }
  return null;
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className={`capitalize text-[11px] font-semibold ${ROLE_COLORS[role] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
    >
      {role}
    </Badge>
  );
}
