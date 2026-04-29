"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns, faUsers, faGraduationCap, faChalkboard,
  faCalendarDays, faCreditCard, faClipboardList, faChartColumn,
  faBus, faBullhorn, faChartPie, faGear, faImages,
  faRightFromBracket, faCircleQuestion, faChevronUp, faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { clearSession } from "@/lib/auth";

const navItems = [
  { label: "Dashboard",          icon: faTableColumns,  href: "/"             },
  { label: "Students",           icon: faUsers,         href: "/students"     },
  // { label: "Teachers",        icon: faGraduationCap, href: "/teachers"     },
  { label: "Classes & Subjects", icon: faChalkboard,    href: "/classes"      },
  { label: "Timetable",          icon: faCalendarDays,  href: "/timetable"    },
  { label: "Fees & Finance",     icon: faCreditCard,    href: "/fees"         },
  { label: "Exams & Results",    icon: faClipboardList, href: "/exams"        },
  { label: "Attendance",         icon: faChartColumn,   href: "/attendance"   },
  { label: "Transport",          icon: faBus,           href: "/transport"    },
  { label: "Announcements",      icon: faBullhorn,      href: "/announcements"},
  { label: "Gallery",            icon: faImages,        href: "/gallery"      },
  { label: "Reports",            icon: faChartPie,      href: "/reports"      },
  { label: "Settings",           icon: faGear,          href: "/settings"     },
];

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer rounded rectangle */}
      <rect
        x="1.5" y="1.5"
        width="15" height="15"
        rx="2.5"
        stroke="#94a3b8"
        strokeWidth="1.4"
        fill="none"
      />
      {/* Inner vertical line — slides right when collapsed */}
      <line
        x1="5.5" y1="5"
        x2="5.5" y2="13"
        stroke="#64748b"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{
          transform: collapsed ? "translateX(6px)" : "translateX(0px)",
          transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      />
    </svg>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sms-sidebar-collapsed") === "true";
    }
    return false;
  });
  const [hovered, setHovered] = useState(false);

  // Persist collapsed state across page navigations
  useEffect(() => {
    localStorage.setItem("sms-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Load user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sms_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Visually expanded when not collapsed OR when hovering over a collapsed sidebar
  const isExpanded = !collapsed || hovered;

  return (
    <aside
      style={{
        width: isExpanded ? 220 : 56,
        transition: "width 280ms cubic-bezier(0.4,0,0.2,1)",
      }}
      className="relative flex flex-col h-screen bg-white border-r border-slate-200 shrink-0 sticky top-0 z-40 overflow-visible"
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (collapsed) setMenuOpen(false); }}
    >
      {/* Logo */}
      <div className="flex items-center border-b border-slate-200 px-3 py-[11px] shrink-0 gap-2 overflow-hidden h-14">
        <Image
          src="/logo.png"
          alt="KD Institute"
          width={32}
          height={32}
          className="rounded-md shrink-0 object-contain"
        />
        <div
          className="flex-1 min-w-0 overflow-hidden"
          style={{
            opacity: isExpanded ? 1 : 0,
            maxWidth: isExpanded ? 160 : 0,
            transition: "opacity 180ms ease, max-width 280ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <p className="text-[#212529] font-bold text-[12px] leading-tight whitespace-nowrap">KD Institute</p>
          <p className="text-slate-400 text-[10px] mt-0.5 whitespace-nowrap">of Advance Education</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col gap-0.5">
        {navItems.map(({ label, icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              title={!isExpanded ? label : undefined}
              className={`flex items-center rounded-md text-[13px] font-medium whitespace-nowrap mx-1.5 transition-colors ${
                active
                  ? "bg-[#007BFF] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#212529]"
              }`}
              style={{
                height: 36,
                // Fixed left padding — icon NEVER moves
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              <FontAwesomeIcon
                icon={icon}
                className="w-[14px] shrink-0"
                style={{
                  // Only margin animates, not position
                  marginRight: isExpanded ? 10 : 0,
                  transition: "margin-right 280ms cubic-bezier(0.4,0,0.2,1)",
                }}
              />
              <span
                className="overflow-hidden"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  maxWidth: isExpanded ? 160 : 0,
                  transition: "opacity 180ms ease, max-width 280ms cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => {
          setCollapsed((c) => !c);
          setHovered(false);
          if (isExpanded) setMenuOpen(false);
        }}
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        style={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 150ms ease, box-shadow 150ms ease",
        }}
        className="shadow-none bg-white cursor-pointer z-50 m-3 ml-4"
      >
        <CollapseIcon collapsed={collapsed} />
      </button>

      {/* Footer */}
      <div className="border-t border-slate-200 shrink-0">
        {/* Collapsible menu — hidden when sidebar is collapsed */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            maxHeight: menuOpen && isExpanded ? 120 : 0,
            opacity: menuOpen && isExpanded ? 1 : 0,
            transition: "max-height 280ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
          }}
        >
          <div className="px-2 pt-2 pb-1 flex flex-col gap-0.5">
            <Link
              href="#"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] text-slate-600 hover:bg-slate-100 hover:text-[#212529] transition-colors"
            >
              <FontAwesomeIcon icon={faCircleQuestion} className="w-[13px] shrink-0" />
              <span>Help &amp; Support</span>
            </Link>
            <button
              onClick={() => { clearSession(); router.replace("/login"); }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] text-red-500 hover:bg-red-50 transition-colors w-full">
              <FontAwesomeIcon icon={faRightFromBracket} className="w-[13px] shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => isExpanded && setMenuOpen((o) => !o)}
          title={!isExpanded ? (user?.name ?? "User") : undefined}
          className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFCA2B] flex items-center justify-center text-[#212529] text-[10px] font-bold shrink-0">
            {user ? getInitials(user.name) : "??"}
          </div>
          <div
            className="flex flex-1 items-center gap-2 min-w-0 overflow-hidden"
            style={{
              opacity: isExpanded ? 1 : 0,
              maxWidth: isExpanded ? 200 : 0,
              transition: "opacity 180ms ease, max-width 280ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-semibold text-[#212529] leading-tight truncate whitespace-nowrap">{user?.name ?? "—"}</p>
              <p className="text-[10px] text-slate-500 leading-tight truncate whitespace-nowrap">{user?.email ?? "—"}</p>
            </div>
            <FontAwesomeIcon
              icon={menuOpen ? faChevronDown : faChevronUp}
              className="text-slate-400 text-[10px] shrink-0"
            />
          </div>
        </button>
      </div>
    </aside>
  );
}