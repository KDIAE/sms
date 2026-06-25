"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faBell } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { NOTIF_SETTINGS } from "../_shared";

export default function NotificationsSettingsPage() {
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    fee_due: true, attendance: true, exam_schedule: true,
    announcements: false, results: true, transport: false,
  });

  return (
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
          <div key={n.key} className="flex items-start justify-between gap-4 py-3">
            <div className="flex-1">
              <p className="text-[13px] font-medium text-slate-800">{n.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
            </div>
            <Checkbox
              id={`notif-${n.key}`}
              checked={notifs[n.key]}
              onCheckedChange={(v) => setNotifs((prev) => ({ ...prev, [n.key]: !!v }))}
              className="mt-0.5 data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF]"
            />
          </div>
        ))}
        <div className="pt-3 flex justify-end">
          <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
            <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
