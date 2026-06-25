"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const FIELDS = [
  { label: "Student Portal URL",        val: "sms.kdiae.in" },
  { label: "Teacher Portal URL",        val: "tms.kdiae.in" },
  { label: "Session Timeout (minutes)", val: "30"           },
];

export default function PortalSettingsPage() {
  return (
    <Card className="shadow-none border-slate-200 max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faGlobe} className="text-[#007BFF] text-[13px]" />
          <CardTitle className="text-[14px]">Portal Settings</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 flex flex-col gap-4">
        {FIELDS.map((f) => (
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
  );
}
