"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ── Data ─────────────────────────────────────────────────────────────────────

const ANNOUNCEMENTS = [
  {
    id: 1, title: "Annual Sports Day – April 20, 2025",
    content: "Annual Sports Day will be held on April 20, 2025 at the school grounds. Students must wear sports attire. Parents are welcome.",
    audience: ["Students", "Parents"], date: "Apr 10, 2025", time: "10:00 AM", priority: "High",
  },
  {
    id: 2, title: "Staff Development Workshop",
    content: "A professional development workshop for all teaching staff will be conducted on April 25, 2025. Attendance is mandatory.",
    audience: ["Teachers"], date: "Apr 9, 2025", time: "2:00 PM", priority: "High",
  },
  {
    id: 3, title: "Annual Exam Timetable Released",
    content: "The timetable for Annual Exams (May 5–15, 2025) has been published. Students may collect hard copies from the office.",
    audience: ["Students", "Parents"], date: "Apr 8, 2025", time: "11:00 AM", priority: "Normal",
  },
  {
    id: 4, title: "Fee Payment Reminder – April Deadline",
    content: "This is a reminder that the April instalment deadline is April 15, 2025. Please complete payment via UPI, NEFT, or cash.",
    audience: ["Parents"], date: "Apr 7, 2025", time: "9:00 AM", priority: "High",
  },
  {
    id: 5, title: "Library Book Return Notice",
    content: "All borrowed library books must be returned by April 18, 2025. Students with overdue books will be reminded by class teachers.",
    audience: ["Students"], date: "Apr 5, 2025", time: "3:00 PM", priority: "Normal",
  },
];

const audienceCls: Record<string, string> = {
  Students: "bg-blue-50 text-blue-700 border-blue-200",
  Teachers: "bg-amber-50 text-amber-700 border-amber-200",
  Parents:  "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityCls: Record<string, string> = {
  High:   "bg-red-50 text-red-700 border-red-200",
  Normal: "bg-slate-100 text-slate-600 border-slate-200",
};

const FILTERS = ["All", "Students", "Teachers", "Parents"];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = ANNOUNCEMENTS.filter((a) =>
    filter === "All" || a.audience.includes(filter)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Announcements" description="Broadcast notices to students, teachers, and parents" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Announcements", value: ANNOUNCEMENTS.length },
                { label: "For Students",        value: ANNOUNCEMENTS.filter((a) => a.audience.includes("Students")).length },
                { label: "For Teachers",        value: ANNOUNCEMENTS.filter((a) => a.audience.includes("Teachers")).length },
                { label: "For Parents",         value: ANNOUNCEMENTS.filter((a) => a.audience.includes("Parents")).length },
              ].map((st) => (
                <Card key={st.label} className="shadow-none border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold text-slate-900">{st.value}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">{st.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* List card */}
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">Announcements</CardTitle>
                  <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-1.5" onClick={() => setShowModal(true)}>
                    <FontAwesomeIcon icon={faPlus} className="text-[12px]" />
                    New Announcement
                  </Button>
                </div>
                {/* Audience filter pills */}
                <div className="flex items-center gap-2 mt-3">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
                        filter === f
                          ? "bg-[#007BFF] text-white border-[#007BFF]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 flex flex-col gap-3">
                {filtered.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#007BFF]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faBullhorn} className="text-[#007BFF] text-[12px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900">{a.title}</p>
                          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{a.content}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {a.audience.map((aud) => (
                              <span key={aud} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${audienceCls[aud]}`}>
                                {aud}
                              </span>
                            ))}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityCls[a.priority]}`}>
                              {a.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">{a.date}</p>
                        <p className="text-[11px] text-slate-400">{a.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </main>
      </div>

      {/* New Announcement Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[480px] max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">New Announcement</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="flex flex-col gap-3 py-2">
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Title</label>
              <Input placeholder="Announcement title…" className="bg-slate-50 border-slate-200 text-[13px] h-8" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Content</label>
              <Textarea
                placeholder="Write announcement content…"
                rows={4}
                className="bg-slate-50 border-slate-200 text-[13px] resize-none"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Audience</label>
              <div className="flex gap-4">
                {["Students", "Teachers", "Parents"].map((aud) => (
                  <div key={aud} className="flex items-center gap-1.5">
                    <Checkbox id={`aud-${aud}`} />
                    <label htmlFor={`aud-${aud}`} className="text-[12px] text-slate-700 cursor-pointer">{aud}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Priority</label>
              <RadioGroup defaultValue="Normal" className="flex gap-4">
                {["Normal", "High"].map((p) => (
                  <div key={p} className="flex items-center gap-1.5">
                    <RadioGroupItem value={p} id={`priority-${p}`} />
                    <label htmlFor={`priority-${p}`} className="text-[12px] text-slate-700 cursor-pointer">{p}</label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px]">
              Send Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
