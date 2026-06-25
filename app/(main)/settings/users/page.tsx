"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faPlus, faPencil, faTrash, faSpinner, faCheck,
  faKey, faEye, faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { usersApi, type AppUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ROLE_OPTIONS, RoleBadge } from "../_shared";

// ── User Dialog ───────────────────────────────────────────────────────────────

interface UserFormState {
  name: string; email: string; role: string; password: string; is_active: boolean;
}
const BLANK: UserFormState = { name: "", email: "", role: "teacher", password: "", is_active: true };

function UserDialog({ open, onClose, initial, onSaved }: {
  open: boolean; onClose: () => void; initial: AppUser | null; onSaved: (u: AppUser) => void;
}) {
  const isEdit = !!initial;
  const [form, setForm]     = useState<UserFormState>({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name, email: initial.email, role: initial.role, password: "", is_active: initial.is_active }
        : { ...BLANK });
      setError(""); setShowPw(false);
    }
  }, [open, initial]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!isEdit && !form.email.trim()) { setError("Email is required."); return; }
    setSaving(true); setError("");
    try {
      let saved: AppUser;
      if (isEdit) {
        const patch: Partial<{ name: string; role: string; password: string; is_active: boolean }> = {
          name: form.name, role: form.role, is_active: form.is_active,
        };
        if (form.password) patch.password = form.password;
        saved = await usersApi.update(initial!.id, patch);
      } else {
        saved = await usersApi.invite({ name: form.name, email: form.email, role: form.role });
      }
      onSaved(saved);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-md w-[calc(100vw-1.5rem)] sm:w-full flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-6 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Full Name</label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Anita Sen" className="h-8 text-[13px] bg-white border-slate-200" />
          </div>
          {!isEdit && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Email</label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. teacher@kdiae.in" type="email" className="h-8 text-[13px] bg-white border-slate-200" />
            </div>
          )}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1.5">Role</label>
            <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
              <SelectTrigger className="h-9 text-[13px] bg-white border-slate-200 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize text-[13px]">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                New Password (leave blank to keep current)
              </label>
              <div className="relative">
                <Input value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  type={showPw ? "text" : "password"} placeholder="Leave blank to keep"
                  className="h-8 text-[13px] bg-white border-slate-200 pr-9" />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} className="text-[12px]" />
                </button>
              </div>
            </div>
          )}
          {!isEdit && (
            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-[12px] text-blue-700">
              <FontAwesomeIcon icon={faKey} className="mt-0.5 shrink-0 text-[11px]" />
              <span>An invitation email will be sent to this address so the user can set their own password.</span>
            </div>
          )}
          {isEdit && (
            <div className="flex items-center gap-3">
              <Checkbox id="is_active" checked={form.is_active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: !!v }))}
                className="data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF]" />
              <label htmlFor="is_active" className="text-[13px] text-slate-700 cursor-pointer select-none">
                Account Active
              </label>
            </div>
          )}
        </div>
        <div className="p-4 pt-0 shrink-0 border-t border-slate-100">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5 mb-3">{error}</p>}
          <DialogFooter className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button size="sm" className="h-8 text-[13px] bg-[#007BFF] hover:bg-[#0069d9] text-white" onClick={handleSave} disabled={saving}>
              {saving
                ? <><FontAwesomeIcon icon={faSpinner} className="mr-1.5 animate-spin" />Saving…</>
                : isEdit
                  ? <><FontAwesomeIcon icon={faCheck} className="mr-1.5 text-[11px]" />Save Changes</>
                  : <><FontAwesomeIcon icon={faPlus} className="mr-1.5 text-[11px]" />Send Invite</>}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersSettingsPage() {
  const { user: me } = useAuth();
  const [users, setUsers]           = useState<AppUser[]>([]);
  const [loading, setLoading]       = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    usersApi.list(controller.signal)
      .then((data) => { setUsers(data); setLoading(false); })
      .catch((e) => { if ((e as Error).name !== "AbortError") setLoading(false); });

    return () => controller.abort();
  }, []);

  const handleDelete = async (u: AppUser) => {
    if (!confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    await usersApi.delete(u.id);
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
  };

  const handleSaved = (saved: AppUser) => {
    setUsers((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      return idx >= 0 ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev];
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-slate-800">System Users</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Manage login accounts for Admin, Principal, Teacher and Finance staff.
            </p>
          </div>
          <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-1.5"
            onClick={() => { setEditTarget(null); setShowDialog(true); }}>
            <FontAwesomeIcon icon={faPlus} className="text-[11px]" /> New User
          </Button>
        </div>

        <Card className="shadow-none border-slate-200 py-0">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-2xl" />
                <p className="text-[13px]">No users found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#FFCA2B] flex items-center justify-center text-[#212529] text-[10px] font-bold shrink-0">
                      {u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate flex items-center gap-2">
                        {u.name}
                        {!u.is_active && (
                          <Badge variant="outline" className="text-[10px] font-semibold text-slate-400 bg-slate-100 border-slate-200">
                            Pending / Inactive
                          </Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{u.email}</p>
                    </div>
                    <RoleBadge role={u.role} />
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-[#007BFF] hover:bg-blue-50"
                        onClick={() => { setEditTarget(u); setShowDialog(true); }}>
                        <FontAwesomeIcon icon={faPencil} className="text-[11px]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === me?.id}>
                        <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UserDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        initial={editTarget}
        onSaved={handleSaved}
      />
    </>
  );
}
