"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faUsers, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { settingsApi, type RoleEntry } from "@/lib/api";
import { PERM_KEYS, ROLES_DEFAULTS, SaveStatus, type SaveStatusType } from "../_shared";

export default function RolesSettingsPage() {
  const [matrix, setMatrix]   = useState<RoleEntry[]>(ROLES_DEFAULTS);
  const [loaded, setLoaded]   = useState(false);
  const [status, setStatus]   = useState<SaveStatusType>("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await settingsApi.getRoles(controller.signal);
        if (data.roles?.length) setMatrix(data.roles);
        setLoaded(true);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setLoaded(true); // show defaults on error
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const toggle = (roleIdx: number, perm: string) => {
    setMatrix((prev) =>
      prev.map((r, i) =>
        i === roleIdx ? { ...r, perms: { ...r.perms, [perm]: !r.perms[perm] } } : r
      )
    );
  };

  const save = async () => {
    setStatus("saving");
    try {
      const data = await settingsApi.updateRoles({ roles: matrix });
      if (data.roles?.length) setMatrix(data.roles);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <Card className="shadow-none border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-[#007BFF] text-[13px]" />
          <CardTitle className="text-[14px]">Role Permissions</CardTitle>
        </div>
        <p className="text-[12px] text-slate-500 mt-1">
          Click a cell to toggle access for Principal, Teacher and Finance roles. Admin permissions are fixed.
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="pt-0 overflow-x-auto">
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-28">Role</TableHead>
              {PERM_KEYS.map((k) => (
                <TableHead key={k} className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 capitalize px-2">
                  <div className="flex justify-center">{k}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.map((r, roleIdx) => {
              const isLocked = r.role === "Admin";
              return (
                <TableRow key={r.role}>
                  <TableCell className="py-3">
                    <Badge variant="outline" className={`text-[11px] font-semibold ${r.color}`}>
                      {r.role}
                    </Badge>
                  </TableCell>
                  {PERM_KEYS.map((k) => (
                    <TableCell key={k} className="px-2 py-3">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={!!r.perms[k]}
                          onCheckedChange={() => !isLocked && toggle(roleIdx, k)}
                          disabled={isLocked || !loaded}
                          className="data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF] cursor-pointer"
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-3 pt-4 pb-1">
          <SaveStatus status={status} />
          <Button
            size="sm"
            className="bg-[#007BFF] hover:bg-[#0069d9] text-white h-8 text-[13px] gap-1.5"
            onClick={save}
            disabled={status === "saving" || !loaded}
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
