"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faBuilding, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsApi, type SchoolSettings } from "@/lib/api";
import { SaveStatus, type SaveStatusType } from "../_shared";

const BLANK: SchoolSettings = {
  school_name: "", address: "", phone: "", email: "", website: "", school_type: "", motto: "",
};

export default function SchoolSettingsPage() {
  const [school, setSchool]     = useState<SchoolSettings>(BLANK);
  const [loaded, setLoaded]     = useState(false);
  const [status, setStatus]     = useState<SaveStatusType>("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await settingsApi.getSchool(controller.signal);
        setSchool(data);
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
      const updated = await settingsApi.updateSchool(school);
      setSchool(updated);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <Card className="shadow-none border-slate-200 max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBuilding} className="text-[#007BFF] text-[13px]" />
          <CardTitle className="text-[14px]">School Information</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 grid grid-cols-2 gap-4">
        {([
          { label: "School Name", key: "school_name" as const, full: true },
          { label: "Address",     key: "address"     as const, full: true },
          { label: "Phone",       key: "phone"       as const },
          { label: "Email",       key: "email"       as const },
          { label: "Website",     key: "website"     as const },
          { label: "School Type", key: "school_type" as const },
          { label: "Motto",       key: "motto"       as const, full: true },
        ] as { label: string; key: keyof SchoolSettings; full?: boolean }[]).map((f) => (
          <div key={f.key} className={f.full ? "col-span-2" : ""}>
            <label className="text-[12px] font-medium text-slate-600 mb-1 block">{f.label}</label>
            {!loaded ? (
              <Skeleton className="h-8 w-full rounded" />
            ) : (
              <Input
                value={school[f.key]}
                onChange={(e) => setSchool((p) => ({ ...p, [f.key]: e.target.value }))}
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
