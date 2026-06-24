"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      setDashboard(await smsFeesApi.summary());
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchAdmission = useCallback(async () => {
    setLoadingAdm(true);
    try {
      const q: Record<string, string> = {};
      if (classFilter !== "All") q.class_name = classFilter;
      if (search) q.search = search;
      const qs = new URLSearchParams(q).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fees/sms/admission${qs ? `?${qs}` : ""}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` } },
      );
      setAdmissionRows(await res.json());
    } finally { setLoadingAdm(false); }
  }, [classFilter, search]);

  const fetchTuition = useCallback(async () => {
    setLoadingTui(true);
    try {
      const q: Record<string, string> = {};
      if (classFilter !== "All") q.class_name = classFilter;
      if (search) q.search = search;
      const qs = new URLSearchParams(q).toString();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fees/sms/tuition${qs ? `?${qs}` : ""}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` } },
      );
      setTuitionRows(await res.json());
    } finally { setLoadingTui(false); }
  }, [classFilter, search]);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const q: Record<string, string> = {};
      if (classFilter !== "All") q.class_name = classFilter;
      if (search) q.search = search;
      const booksQs   = new URLSearchParams({ ...q, type: "Books" }).toString();
      const uniformQs = new URLSearchParams({ ...q, type: "Uniform" }).toString();
      const headers = { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` };
      const base = process.env.NEXT_PUBLIC_API_URL;
      const [bRes, uRes] = await Promise.all([
        fetch(`${base}/api/fees/sms/items?${booksQs}`,   { headers }),
        fetch(`${base}/api/fees/sms/items?${uniformQs}`, { headers }),
      ]);
      setBookRows(await bRes.json());
      setUniformRows(await uRes.json());
    } finally { setLoadingItems(false); }
  }, [classFilter, search]);

  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await studentsApi.list({ limit: 200 });
      setAllStudents(res.data);
      const classSet = new Set(res.data.map(s => s.class_name).filter(Boolean));
      setClasses(Array.from(classSet).sort());
    } catch { /* non-critical */ }
  }, []);

  const fetchStructures = useCallback(async () => {
    setLoadingStruct(true);
    try {
      const [structs, classList] = await Promise.all([
        smsFeesApi.getStructures(),
        classesApi.list(),
      ]);
      const structMap = Object.fromEntries(structs.map(s => [s.class_name, s]));
      const merged = classList.map(c => structMap[c.name] ?? { class_name: c.name, admission_fee: 0, registration_fee: 0, annual_fee: 0, tuition_fee: 0, transport_fee: 0, uniform_fee: 0 });
      setFeeStructures(merged);
    } catch { /* non-critical */ } finally {
      setLoadingStruct(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchAllStudents();
    fetchStructures();
  }, [fetchDashboard, fetchAllStudents, fetchStructures]);

  useEffect(() => {
    if (tab === "admissions") fetchAdmission();
    if (tab === "tuition")    fetchTuition();
    if (tab === "books" || tab === "uniforms") fetchItems();
    if (tab === "dashboard")  fetchDashboard();
    if (tab === "structure")  fetchStructures();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, classFilter, search]);

  const handleRecord = async (
    studentId: string,
    feeType: FeeTypeOption,
    monthKey: string | null,
    amount: number,
    method: PaymentMethod,
    date: string,
  ) => {
    await smsFeesApi.record({ student_id: studentId, fee_type: feeType, month_key: monthKey ?? undefined, amount, method, date });
    fetchDashboard();
    if (feeType === "Admission")       fetchAdmission();
    if (feeType === "Monthly Tuition") fetchTuition();
    if (feeType === "Books" || feeType === "Uniform") fetchItems();
  };

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
