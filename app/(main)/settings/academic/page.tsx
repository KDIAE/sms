"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faGraduationCap, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsApi, type AcademicSettings } from "@/lib/api";
import { SaveStatus, type SaveStatusType } from "../_shared";

const BLANK: AcademicSettings = {
  academic_year: "", current_term: "", term_start_date: "", term_end_date: "", next_session_start: "",
};

export default function AcademicSettingsPage() {
  const [academic, setAcademic] = useState<AcademicSettings>(BLANK);
  const [loaded, setLoaded]     = useState(false);
  const [status, setStatus]     = useState<SaveStatusType>("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await settingsApi.getAcademic(controller.signal);
        setAcademic(data);
        setLoaded(true);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const save = async () => {
    setStatus("saving");
    try {
      const updated = await settingsApi.updateAcademic(academic);
      setAcademic(updated);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const FIELDS: { label: string; key: keyof AcademicSettings; full?: boolean }[] = [
    { label: "Academic Year",      key: "academic_year"      },
    { label: "Current Term",       key: "current_term"       },
    { label: "Term Start Date",    key: "term_start_date"    },
    { label: "Term End Date",      key: "term_end_date"      },
    { label: "Next Session Start", key: "next_session_start", full: true },
  ];

  return (
    <Card className="shadow-none border-slate-200 max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faGraduationCap} className="text-[#007BFF] text-[13px]" />
          <CardTitle className="text-[14px]">Academic Session</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 grid grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.full ? "col-span-2" : ""}>
            <label className="text-[12px] font-medium text-slate-600 mb-1 block">{f.label}</label>
            {!loaded ? (
              <Skeleton className="h-8 w-full rounded" />
            ) : (
              <Input
                value={academic[f.key]}
                onChange={(e) => setAcademic((p) => ({ ...p, [f.key]: e.target.value }))}
                className="bg-slate-50 border-slate-200 text-[13px] h-8"
              />
            )}
          </div>
        ))}
        <div className="col-span-2 flex items-center justify-end gap-3 pt-2">
          <SaveStatus status={status} />
          <Button
            size="sm"
            className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5"
            onClick={save}
            disabled={status === "saving"}
          >
            {status === "saving"
              ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-[11px]" /> Saving…</>
              : <><FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save Changes</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
