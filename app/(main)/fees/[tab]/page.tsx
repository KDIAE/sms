"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  smsFeesApi,
  studentsApi,
  classesApi,
  type SmsFeeDashboard,
  type SmsAdmissionFeeRow,
  type SmsTuitionRow,
  type SmsItemFeeRow,
  type Student,
  type ClassFeeStructure,
} from "@/lib/api";
import { DashboardTab }    from "@/components/fees/DashboardTab";
import { AdmissionTab }    from "@/components/fees/AdmissionTab";
import { TuitionTab }      from "@/components/fees/TuitionTab";
import { ItemTab }         from "@/components/fees/ItemTab";
import { FeeStructureTab } from "@/components/fees/FeeStructureTab";
import { LogFeeDialog, type FeeTypeOption, type PaymentMethod } from "@/components/fees/shared";

const VALID_TABS = ["dashboard", "admissions", "tuition", "books", "uniforms", "structure"] as const;
type TabValue = typeof VALID_TABS[number];

export default function FeesPage() {
  const router = useRouter();
  const params = useParams();
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : "dashboard";

  const navigateTab = (value: string) => router.push(`/fees/${value}`);

  const [classFilter,  setClassFilter]  = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,       setSearch]       = useState("");
  const [logFeeOpen,   setLogFeeOpen]   = useState(false);

  const [dashboard,     setDashboard]     = useState<SmsFeeDashboard | null>(null);
  const [admissionRows, setAdmissionRows] = useState<SmsAdmissionFeeRow[]>([]);
  const [tuitionRows,   setTuitionRows]   = useState<SmsTuitionRow[]>([]);
  const [bookRows,      setBookRows]      = useState<SmsItemFeeRow[]>([]);
  const [uniformRows,   setUniformRows]   = useState<SmsItemFeeRow[]>([]);
  const [allStudents,   setAllStudents]   = useState<Student[]>([]);
  const [classes,       setClasses]       = useState<string[]>([]);
  const [feeStructures, setFeeStructures] = useState<ClassFeeStructure[]>([]);

  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingAdm,    setLoadingAdm]    = useState(false);
  const [loadingTui,    setLoadingTui]    = useState(false);
  const [loadingItems,  setLoadingItems]  = useState(false);
  const [loadingStruct, setLoadingStruct] = useState(false);

  // AbortController refs — one per fetch group so each can be cancelled independently
  const tabCtrl      = useRef<AbortController | null>(null);
  const mountCtrl    = useRef<AbortController | null>(null);

  // ── Standalone fetchDashboard (used by DashboardTab onRetry) ─────────────
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const data = await smsFeesApi.summary();
      setDashboard(data);
    } catch (e) {
      console.error("Error fetching dashboard:", e);
    } finally {
      setLoadingDash(false);
    }
  }, []);

  // ── On-mount: fetch dashboard, students list, and fee structures ──────────
  useEffect(() => {
    const controller = new AbortController();
    mountCtrl.current = controller;
    const { signal } = controller;

    async function loadMount() {
      setLoadingDash(true);
      try {
        const [dashData, studentsRes] = await Promise.all([
          smsFeesApi.summary(signal),
          studentsApi.list({ limit: 200 }, signal),
        ]);
        if (signal.aborted) return;
        setDashboard(dashData);
        setAllStudents(studentsRes.data);
        const classSet = new Set(studentsRes.data.map((s) => s.class_name).filter(Boolean));
        setClasses(Array.from(classSet).sort());
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        console.error("Error loading fees mount data:", e);
      } finally {
        if (!signal.aborted) setLoadingDash(false);
      }

      // Structures fetch (non-critical)
      setLoadingStruct(true);
      try {
        const [structs, classList] = await Promise.all([
          smsFeesApi.getStructures(signal),
          classesApi.list(),
        ]);
        if (signal.aborted) return;
        const structMap = Object.fromEntries(structs.map((s) => [s.class_name, s]));
        const merged = classList.map(
          (c) => structMap[c.name] ?? { class_name: c.name, admission_fee: 0, registration_fee: 0, annual_fee: 0, tuition_fee: 0, transport_fee: 0, uniform_fee: 0 },
        );
        setFeeStructures(merged);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      } finally {
        if (!signal.aborted) setLoadingStruct(false);
      }
    }

    loadMount();
    return () => controller.abort();
  }, []);

  // ── Tab / filter changes: cancel previous in-flight request ───────────────
  useEffect(() => {
    // Abort any previous tab fetch
    tabCtrl.current?.abort();
    const controller = new AbortController();
    tabCtrl.current = controller;
    const { signal } = controller;

    const params = classFilter !== "All" ? { class_name: classFilter, search } : (search ? { search } : undefined);

    async function loadTab() {
      if (tab === "dashboard") {
        setLoadingDash(true);
        try {
          const data = await smsFeesApi.summary(signal);
          if (!signal.aborted) setDashboard(data);
        } catch (e) {
          if ((e as Error).name !== "AbortError") console.error(e);
        } finally {
          if (!signal.aborted) setLoadingDash(false);
        }
        return;
      }

      if (tab === "admissions") {
        setLoadingAdm(true);
        try {
          const rows = await smsFeesApi.admission(params, signal);
          if (!signal.aborted) setAdmissionRows(rows);
        } catch (e) {
          if ((e as Error).name !== "AbortError") console.error(e);
        } finally {
          if (!signal.aborted) setLoadingAdm(false);
        }
        return;
      }

      if (tab === "tuition") {
        setLoadingTui(true);
        try {
          const rows = await smsFeesApi.tuition(params, signal);
          if (!signal.aborted) setTuitionRows(rows);
        } catch (e) {
          if ((e as Error).name !== "AbortError") console.error(e);
        } finally {
          if (!signal.aborted) setLoadingTui(false);
        }
        return;
      }

      if (tab === "books" || tab === "uniforms") {
        setLoadingItems(true);
        try {
          const [bRows, uRows] = await Promise.all([
            smsFeesApi.items("Books",   params, signal),
            smsFeesApi.items("Uniform", params, signal),
          ]);
          if (!signal.aborted) {
            setBookRows(bRows);
            setUniformRows(uRows);
          }
        } catch (e) {
          if ((e as Error).name !== "AbortError") console.error(e);
        } finally {
          if (!signal.aborted) setLoadingItems(false);
        }
        return;
      }

      if (tab === "structure") {
        setLoadingStruct(true);
        try {
          const [structs, classList] = await Promise.all([
            smsFeesApi.getStructures(signal),
            classesApi.list(),
          ]);
          if (signal.aborted) return;
          const structMap = Object.fromEntries(structs.map((s) => [s.class_name, s]));
          const merged = classList.map(
            (c) => structMap[c.name] ?? { class_name: c.name, admission_fee: 0, registration_fee: 0, annual_fee: 0, tuition_fee: 0, transport_fee: 0, uniform_fee: 0 },
          );
          setFeeStructures(merged);
        } catch (e) {
          if ((e as Error).name !== "AbortError") console.error(e);
        } finally {
          if (!signal.aborted) setLoadingStruct(false);
        }
      }
    }

    loadTab();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, classFilter, search]);

  const handleRecord = useCallback(async (
    studentId: string,
    feeType: FeeTypeOption,
    monthKey: string | null,
    amount: number,
    method: PaymentMethod,
    date: string,
  ) => {
    await smsFeesApi.record({ student_id: studentId, fee_type: feeType, month_key: monthKey ?? undefined, amount, method, date });
    // Refresh affected data without cancelling any existing tab controller
    const refreshCtrl = new AbortController();
    const { signal } = refreshCtrl;
    try {
      const dash = await smsFeesApi.summary(signal);
      setDashboard(dash);
      if (feeType === "Admission")       setAdmissionRows(await smsFeesApi.admission(undefined, signal));
      if (feeType === "Monthly Tuition") setTuitionRows(await smsFeesApi.tuition(undefined, signal));
      if (feeType === "Books" || feeType === "Uniform") {
        const [b, u] = await Promise.all([
          smsFeesApi.items("Books",   undefined, signal),
          smsFeesApi.items("Uniform", undefined, signal),
        ]);
        setBookRows(b);
        setUniformRows(u);
      }
    } catch { /* non-critical */ }
  }, []);

  return (
    <>
      <LogFeeDialog
        open={logFeeOpen}
        onClose={() => setLogFeeOpen(false)}
        monthKeys={dashboard?.month_keys ?? []}
        monthLabels={dashboard?.month_labels ?? []}
        students={allStudents}
        feeStructures={feeStructures}
        onRecord={handleRecord}
      />

      <Tabs value={tab} onValueChange={navigateTab}>
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList className="flex-wrap h-auto gap-0.5">
              <TabsTrigger value="dashboard"  className="text-[12px] h-6">Dashboard</TabsTrigger>
              <TabsTrigger value="admissions" className="text-[12px] h-6">Admissions</TabsTrigger>
              <TabsTrigger value="tuition"    className="text-[12px] h-6">Tuition</TabsTrigger>
              <TabsTrigger value="books"      className="text-[12px] h-6">Books</TabsTrigger>
              <TabsTrigger value="uniforms"   className="text-[12px] h-6">Uniforms</TabsTrigger>
              <TabsTrigger value="structure"  className="text-[12px] h-6">Fee Structure</TabsTrigger>
            </TabsList>
            <Button size="sm" className="h-8 text-[12px] bg-[#007BFF] hover:bg-[#0062cc] shrink-0" onClick={() => setLogFeeOpen(true)}>
              + Log Fee
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input className="h-8 w-full sm:w-44 text-[12px] bg-white" placeholder="Search student…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-8 w-full sm:w-32 text-[12px] bg-white"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-[12px]">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <DashboardTab dash={dashboard} loading={loadingDash} onRetry={fetchDashboard} />
        </TabsContent>

        <TabsContent value="admissions" className="mt-0">
          <AdmissionTab
            rows={admissionRows}
            loading={loadingAdm}
            onRecord={(sid, amt, method, date) => handleRecord(sid, "Admission", null, amt, method, date)}
          />
        </TabsContent>

        <TabsContent value="tuition" className="mt-0">
          <TuitionTab
            rows={tuitionRows}
            loading={loadingTui}
            monthKeys={dashboard?.month_keys ?? []}
            monthLabels={dashboard?.month_labels ?? []}
            onRecord={(sid, mk, amt, method, date) => handleRecord(sid, "Monthly Tuition", mk, amt, method, date)}
          />
        </TabsContent>

        <TabsContent value="books" className="mt-0">
          <ItemTab
            label="Books"
            rows={bookRows}
            loading={loadingItems}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onRecord={(sid, amt, method, date) => handleRecord(sid, "Books", null, amt, method, date)}
          />
        </TabsContent>

        <TabsContent value="uniforms" className="mt-0">
          <ItemTab
            label="Uniforms"
            rows={uniformRows}
            loading={loadingItems}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onRecord={(sid, amt, method, date) => handleRecord(sid, "Uniform", null, amt, method, date)}
          />
        </TabsContent>

        <TabsContent value="structure" className="mt-0">
          <FeeStructureTab
            structures={feeStructures}
            loading={loadingStruct}
            onSaved={updated => setFeeStructures(p => p.map(s => s.class_name === updated.class_name ? updated : s))}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
