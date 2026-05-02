"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faBell, faCircleCheck, faTriangleExclamation,
  faCircleInfo, faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ROUTE_META: Record<string, { title: string; description?: string }> = {
  "/":              { title: "Dashboard",        description: "Overview of school operations" },
  "/students":      { title: "Students",         description: "Manage all enrolled students" },
  "/teachers":      { title: "Teachers",         description: "Manage teaching staff and assignments" },
  "/classes":       { title: "Classes & Subjects", description: "Manage class groups, sections, and subject assignments" },
  "/timetable":     { title: "Timetable",        description: "Weekly class schedule" },
  "/fees":          { title: "Fees & Finance",   description: "Admissions, tuition, books and uniforms portal" },
  "/exams":         { title: "Exams & Results",  description: "Manage exam schedules, results, and grading" },
  "/attendance":    { title: "Attendance",       description: "Track and manage student attendance records" },
  "/transport":     { title: "Transport",        description: "Manage school bus routes, drivers, and student transport" },
  "/announcements": { title: "Announcements",    description: "Broadcast notices to students, teachers, and parents" },
  "/gallery":       { title: "Gallery" },
  "/reports":       { title: "Reports",          description: "Analytics and downloadable reports for the school" },
  "/settings":      { title: "Settings",         description: "Manage school configuration and system preferences" },
};

interface NavbarProps {
  title?: string;
  description?: string;
}

export default function Navbar({ title: titleProp, description: descProp }: NavbarProps = {}) {
  const pathname = usePathname();
  const meta = ROUTE_META[pathname] ?? { title: "KDIAE SMS" };
  const title = titleProp ?? meta.title;
  const description = descProp ?? meta.description;

  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="min-w-0 pr-2">
        <h1 className="text-[13px] md:text-sm font-semibold text-[#212529] leading-tight truncate">{title}</h1>
        {description && (
          <p className="hidden md:block text-[11px] text-slate-400 leading-tight mt-0.5">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] pointer-events-none z-10"
          />
          <Input
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: searchFocused ? 240 : 176,
              transition: "width 220ms cubic-bezier(0.4,0,0.2,1)",
            }}
            className="pl-7 h-8 text-[13px] bg-slate-50 border-slate-200 focus-visible:ring-[#007BFF] focus-visible:bg-white"
          />
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative w-8 h-8 text-slate-500">
              <FontAwesomeIcon icon={faBell} className="text-[14px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FFCA2B] rounded-full" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="text-[13px] font-semibold text-[#212529]">Notifications</p>
              <Badge variant="secondary" className="text-[10px] bg-[#FFCA2B]/20 text-[#b38a00] border-0">3 new</Badge>
            </div>
            <div className="flex flex-col divide-y divide-slate-100">
              {[
                { icon: faCircleCheck,        iconCls: "text-green-500",  bg: "bg-green-100",  title: "Fee payment confirmed",      sub: "Rahul Sharma — ₹12,500",     time: "2 min ago"  },
                { icon: faUserPlus,           iconCls: "text-blue-500",   bg: "bg-blue-100",   title: "New student enrolled",       sub: "Priya Patel — Class 10-A",   time: "1 hr ago"   },
                { icon: faTriangleExclamation,iconCls: "text-yellow-500", bg: "bg-yellow-100", title: "Attendance below threshold", sub: "Class 9-B — 68% this week",  time: "3 hr ago"   },
                { icon: faCircleInfo,         iconCls: "text-slate-400",  bg: "bg-slate-100",  title: "Exam schedule published",    sub: "Term 2 finals — May 12–22",  time: "Yesterday"  },
              ].map(({ icon, iconCls, bg, title: t, sub, time }) => (
                <div key={t} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-default">
                  <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <FontAwesomeIcon icon={icon} className={`${iconCls} text-[11px]`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#212529] leading-snug">{t}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="px-4 py-2.5">
              <Button variant="link" className="text-[12px] text-[#007BFF] h-auto p-0 font-medium">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
