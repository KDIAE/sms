"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/settings/school",        label: "School"        },
  { href: "/settings/academic",      label: "Academic"      },
  { href: "/settings/roles",         label: "Roles"         },
  { href: "/settings/users",         label: "Users",        adminOnly: true },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/portal",        label: "Portal"        },
  { href: "/settings/security",      label: "Security"      },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <>
      <div className="flex flex-wrap gap-y-1 bg-slate-100 rounded-lg p-0.5 w-fit mb-4">
        {tabs.map((t) => {
          const isActive = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`text-[12px] h-7 px-3 rounded-md flex items-center transition-colors ${
                isActive
                  ? "bg-white text-[#212529] shadow-sm font-medium"
                  : "text-slate-500 hover:text-[#212529]"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </>
  );
}
