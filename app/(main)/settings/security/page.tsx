"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faShield, faLock, faKey } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const FIELDS = [
  { label: "Minimum Password Length",            val: "8"  },
  { label: "Password Expiry (days)",             val: "90" },
  { label: "Max Login Attempts",                 val: "5"  },
  { label: "Account Lockout Duration (minutes)", val: "15" },
];

export default function SecuritySettingsPage() {
  return (
    <Card className="shadow-none border-slate-200 max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faShield} className="text-[#007BFF] text-[13px]" />
          <CardTitle className="text-[14px]">Security Settings</CardTitle>
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
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="text-amber-600 text-[11px]" />
            <p className="text-[12px] font-medium text-amber-700">Two-Factor Authentication</p>
          </div>
          <p className="text-[11px] text-amber-600 mt-1">
            2FA is currently disabled. Enable it for admin accounts to improve security.
          </p>
          <Button variant="outline" size="sm" className="h-7 text-[12px] mt-2 border-amber-300 text-amber-700 hover:bg-amber-100">
            <FontAwesomeIcon icon={faKey} className="mr-1.5 text-[10px]" />Enable 2FA
          </Button>
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5">
            <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" /> Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
