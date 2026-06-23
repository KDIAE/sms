"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFileLines, faUsers, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export const STEPS = [
  { icon: faUser,      label: "Student Info"  },
  { icon: faFileLines, label: "Documents"     },
  { icon: faUsers,     label: "Guardian Info" },
];

export function StepperHeader({ step }: { step: number }) {
  return (
    <div className="flex items-center min-w-0">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none min-w-0">
          <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[11px] font-semibold transition-colors shrink-0
            ${i === step ? "bg-[#007BFF] text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
            <FontAwesomeIcon icon={i < step ? faCircleCheck : s.icon} className="text-[11px] shrink-0" />
            <span className="hidden xs:inline sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px flex-1 mx-1.5 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
