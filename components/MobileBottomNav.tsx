"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faUsers,
  faUserPlus,
  faClipboardList,
  faEllipsis,
  faChalkboard,
  faCalendarDays,
  faCreditCard,
  faChartColumn,
  faBus,
  faBullhorn,
  faImages,
  faChartPie,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";

const mobileNavItems = [
  { label: "Home", icon: faTableColumns, href: "/" },
  { label: "Students", icon: faUsers, href: "/students" },
  { label: "Admissions", icon: faUserPlus, href: "/admissions" },
  { label: "Exams", icon: faClipboardList, href: "/exams" },
];

const moreNavItems = [
  { label: "Classes & Subjects", icon: faChalkboard, href: "/classes" },
  { label: "Timetable", icon: faCalendarDays, href: "/timetable" },
  { label: "Fees & Finance", icon: faCreditCard, href: "/fees" },
  { label: "Attendance", icon: faChartColumn, href: "/attendance" },
  { label: "Transport", icon: faBus, href: "/transport" },
  { label: "Announcements", icon: faBullhorn, href: "/announcements" },
  { label: "Gallery", icon: faImages, href: "/gallery" },
  { label: "Reports", icon: faChartPie, href: "/reports" },
  { label: "Settings", icon: faGear, href: "/settings" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const moreActive = moreNavItems.some((item) => item.href === pathname);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <ul className="grid h-16 grid-cols-5">
        {mobileNavItems.map(({ label, icon, href }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-[#007BFF]"
                    : "text-slate-500 hover:text-[#212529]"
                }`}
              >
                <FontAwesomeIcon icon={icon} className="text-[13px]" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  moreActive
                    ? "text-[#007BFF]"
                    : "text-slate-500 hover:text-[#212529]"
                }`}
              >
                <FontAwesomeIcon icon={faEllipsis} className="text-[13px]" />
                <span>More</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" sideOffset={10} className="w-64 p-1.5">
              <div className="max-h-72 overflow-y-auto">
                {moreNavItems.map(({ label, icon, href }) => {
                  const active = pathname === href;
                  return (
                    <PopoverClose asChild key={href}>
                      <Link
                        href={href}
                        className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] transition-colors ${
                          active
                            ? "bg-[#007BFF]/10 text-[#007BFF]"
                            : "text-slate-600 hover:bg-slate-100 hover:text-[#212529]"
                        }`}
                      >
                        <FontAwesomeIcon icon={icon} className="text-[12px]" />
                        <span>{label}</span>
                      </Link>
                    </PopoverClose>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </li>
      </ul>
    </nav>
  );
}
