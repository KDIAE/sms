"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk, faShield, faBell, faGlobe, faLock,
  faUsers, faGraduationCap, faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Data ─────────────────────────────────────────────────────────────────────

const PERM_KEYS = ["students", "teachers", "fees", "exams", "reports", "settings", "transport", "announcements"];

const ROLES = [
  { role: "Super Admin", color: "bg-red-50 text-red-700 border-red-200",       perms: { students: true,  teachers: true,  fees: true,  exams: true,  reports: true,  settings: true,  transport: true,  announcements: true  } },
  { role: "Admin",       color: "bg-blue-50 text-blue-700 border-blue-200",     perms: { students: true,  teachers: true,  fees: true,  exams: true,  reports: true,  settings: false, transport: true,  announcements: true  } },
  { role: "Teacher",     color: "bg-amber-50 text-amber-700 border-amber-200",  perms: { students: true,  teachers: false, fees: false, exams: true,  reports: false, settings: false, transport: false, announcements: true  } },
  { role: "Parent",      color: "bg-emerald-50 text-emerald-700 border-emerald-200", perms: { students: false, teachers: false, fees: true,  exams: true,  reports: false, settings: false, transport: true,  announcements: false } },
];

const NOTIF_SETTINGS = [
  { key: "fee_due",       label: "Fee Due Reminders",           desc: "Send automatic reminders to parents when fees are due."         },
  { key: "attendance",    label: "Daily Attendance Alerts",     desc: "Notify parents of student absence via SMS/email."               },
  { key: "exam_schedule", label: "Exam Schedule Notifications", desc: "Alert students and parents when exams are scheduled."           },
  { key: "announcements", label: "Announcement Broadcasts",     desc: "Push announcements to portal users instantly."                  },
  { key: "results",       label: "Results Published Alerts",    desc: "Notify when exam results are published."                        },
  { key: "transport",     label: "Transport Delay Alerts",      desc: "Inform parents of any bus delays or route changes."             },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    fee_due: true, attendance: true, exam_schedule: true, announcements: false, results: true, transport: false,
  });

  return (
    <>
      <Tabs defaultValue="school">
        <TabsList className="bg-slate-100 h-8 p-0.5">
          {[
            { v: "school",        label: "School"        },
            { v: "academic",      label: "Academic"      },
            { v: "roles",         label: "Roles"         },
            { v: "notifications", label: "Notifications" },
            { v: "portal",        label: "Portal"        },
            { v: "security",      label: "Security"      },
          ].map((t) => (
            <TabsTrigger
              key={t.v} value={t.v}
              className="text-[12px] h-7 data-[state=active]:bg-white data-[state=active]:text-[#212529] data-[state=active]:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* ── School ── */}
        <TabsContent value="school" className="mt-4">
          <Card className="shadow-none border-slate-200 max-w-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBuilding} className="text-[#007BFF] text-[13px]" />
                <CardTitle className="text-[14px]">School Information</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
              {[
                { label: "School Name",  val: "KD Institute of Advance Education",                    full: true  },
                { label: "Address",      val: "Ilsoba, Depara, 13 Pandua-Kalna Road, Hooghly-712146",      full: true  },
                { label: "Phone",        val: "+91 74328 00090"                                     },
                { label: "Email",        val: "info@kdiae.in"                                       },
                { label: "Website",      val: "www.kdiae.in"                                        },
                { label: "School Type",  val: "CBSE Co-Education"                                   },
                { label: "Motto",        val: "Knowledge, Integrity, Excellence",       full: true  },
              ].map((f) => (
                <div key={f.label} className={f.full ? "col-span-2" : ""}>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <Input defaultValue={f.val} className="bg-slate-50 border-slate-200 text-[13px] h-8" />
                </div>
              ))}
              <div className="col-span-2 flex justify-end pt-2">
                <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
                  <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── Academic ── */}
        <TabsContent value="academic" className="mt-4">
          <Card className="shadow-none border-slate-200 max-w-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGraduationCap} className="text-[#007BFF] text-[13px]" />
                <CardTitle className="text-[14px]">Academic Session</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
              {[
                { label: "Academic Year",       val: "2026–2027"   },
                { label: "Current Term",        val: "Half-yearly" },
                { label: "Term Start Date",     val: "Apr 1, 2026" },
                { label: "Term End Date",       val: "Aug 31, 2026" },
                { label: "Next Session Start",  val: "Sep 16, 2026", full: true },
              ].map((f) => (
                <div key={f.label} className={(f as { label: string; val: string; full?: boolean }).full ? "col-span-2" : ""}>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <Input defaultValue={f.val} className="bg-slate-50 border-slate-200 text-[13px] h-8" />
                </div>
              ))}
              <div className="col-span-2 flex justify-end pt-2">
                <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
                  <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── Roles ── */}
        <TabsContent value="roles" className="mt-4">
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-[#007BFF] text-[13px]" />
                <CardTitle className="text-[14px]">Role Permissions</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-2.5 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 w-32">Role</th>
                    {PERM_KEYS.map((k) => (
                      <th key={k} className="py-2.5 px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 capitalize">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((r) => (
                    <tr key={r.role} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${r.color}`}>{r.role}</span>
                      </td>
                      {PERM_KEYS.map((k) => (
                        <td key={k} className="py-2.5 px-1 text-center">
                          {(r.perms as Record<string, boolean>)[k]
                            ? <span className="inline-block w-4 h-4 bg-[#007BFF] rounded-sm" title="Allowed" />
                            : <span className="inline-block w-4 h-4 bg-slate-200 rounded-sm" title="Denied" />
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="shadow-none border-slate-200 max-w-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBell} className="text-[#007BFF] text-[13px]" />
                <CardTitle className="text-[14px]">Notification Settings</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-2 flex flex-col divide-y divide-slate-100">
              {NOTIF_SETTINGS.map((n) => (
                <div key={n.key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">{n.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifs((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${notifs[n.key] ? "bg-[#007BFF]" : "bg-slate-200"}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${notifs[n.key] ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
              <div className="pt-3 flex justify-end">
                <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
                  <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── Portal ── */}
        <TabsContent value="portal" className="mt-4">
          <Card className="shadow-none border-slate-200 max-w-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} className="text-[#007BFF] text-[13px]" />
                <CardTitle className="text-[14px]">Portal Settings</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 flex flex-col gap-4">
              {[
                { label: "Student Portal URL",              val: "sms.kolkatadayschool.edu.in"    },
                { label: "Teacher Portal URL",              val: "tms.kolkatadayschool.edu.in"    },
                { label: "Parent Portal URL",               val: "parent.kolkatadayschool.edu.in" },
                { label: "Session Timeout (minutes)",       val: "30"                             },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <Input defaultValue={f.val} className="bg-slate-50 border-slate-200 text-[13px] h-8" />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
                  <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── Security ── */}
        <TabsContent value="security" className="mt-4">
          <Card className="shadow-none border-slate-200 max-w-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShield} className="text-[#007BFF] text-[13px]" />
                <CardTitle className="text-[14px]">Security Settings</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 flex flex-col gap-4">
              {[
                { label: "Minimum Password Length",              val: "8"  },
                { label: "Password Expiry (days)",               val: "90" },
                { label: "Max Login Attempts",                   val: "5"  },
                { label: "Account Lockout Duration (minutes)",   val: "15" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <Input defaultValue={f.val} className="bg-slate-50 border-slate-200 text-[13px] h-8" />
                </div>
              ))}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLock} className="text-amber-600 text-[11px]" />
                  <p className="text-[12px] font-medium text-amber-700">Two-Factor Authentication</p>
                </div>
                <p className="text-[11px] text-amber-600 mt-1">2FA is currently disabled. Enable it for admin accounts to improve security.</p>
                <Button variant="outline" size="sm" className="h-7 text-[12px] mt-2 border-amber-300 text-amber-700 hover:bg-amber-100">Enable 2FA</Button>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
                  <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
