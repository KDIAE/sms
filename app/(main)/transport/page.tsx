"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faPlus, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ── Data ─────────────────────────────────────────────────────────────────────

const ROUTES = [
  {
    id: "R001", name: "North Route", bus: "WB 02 F 1001", time: "7:15 AM",
    stops: ["Dum Dum", "Lake Town", "Ultadanga", "Salt Lake Sec-V"],
    driver: "Ratan Mondal", phone: "+91 99001-10001", capacity: 35, students: 28,
  },
  {
    id: "R002", name: "South Route", bus: "WB 02 F 1002", time: "7:05 AM",
    stops: ["Behala", "Taratala", "New Alipore", "Tollygunge"],
    driver: "Sujit Halder", phone: "+91 99001-10002", capacity: 35, students: 32,
  },
  {
    id: "R003", name: "East Route", bus: "WB 02 F 1003", time: "7:20 AM",
    stops: ["Sonarpur", "Santoshpur", "Kasba", "Garia"],
    driver: "Manas Karmakar", phone: "+91 99001-10003", capacity: 40, students: 25,
  },
  {
    id: "R004", name: "West Route", bus: "WB 02 F 1004", time: "7:10 AM",
    stops: ["Santragachi", "Liluah", "Shibpur", "Howrah St."],
    driver: "Pintu Roy", phone: "+91 99001-10004", capacity: 35, students: 30,
  },
];

const STUDENT_TRANSPORT = [
  { name: "Priya Chatterjee", class: "Class 5-A", route: "North Route", pickup: "Lake Town",  status: "Active"    },
  { name: "Arjun Mukherjee",  class: "Class 6-B", route: "South Route", pickup: "Tollygunge", status: "Active"    },
  { name: "Tanya Roy",        class: "Class 5-B", route: "East Route",  pickup: "Kasba",       status: "Active"    },
  { name: "Rohan Das",        class: "Class 3-C", route: "West Route",  pickup: "Liluah",      status: "Suspended" },
  { name: "Sneha Banerjee",   class: "Class 4-A", route: "South Route", pickup: "Behala",      status: "Active"    },
];

const statusCls: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Suspended: "bg-red-50 text-red-700 border-red-200",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TransportPage() {
  const [tab, setTab] = useState("routes");

  const totalStudents = ROUTES.reduce((a, r) => a + r.students, 0);
  const totalCapacity = ROUTES.reduce((a, r) => a + r.capacity, 0);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Routes",             value: ROUTES.length },
            { label: "Students Using Transport", value: totalStudents },
            { label: "Total Capacity",           value: totalCapacity },
            { label: "Utilisation",              value: `${Math.round((totalStudents / totalCapacity) * 100)}%` },
          ].map((st) => (
            <Card key={st.label} className="shadow-none border-slate-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-slate-900">{st.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{st.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-100 h-8">
            <TabsTrigger value="routes"   className="text-[12px] h-6">Routes</TabsTrigger>
            <TabsTrigger value="students" className="text-[12px] h-6">Students</TabsTrigger>
          </TabsList>
          {/* Routes tab */}
          <TabsContent value="routes" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {ROUTES.map((r) => {
                const utilPct = Math.round((r.students / r.capacity) * 100);
                return (
                  <Card key={r.id} className="shadow-none border-slate-200 hover:border-[#007BFF]/40 hover:shadow-sm transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#007BFF]/10 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faBus} className="text-[#007BFF] text-[13px]" />
                          </div>
                          <div>
                            <CardTitle className="text-[14px]">{r.name}</CardTitle>
                            <CardDescription className="text-[11px]">{r.bus} · {r.time}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-semibold text-slate-700">{r.students}/{r.capacity}</p>
                          <p className="text-[10px] text-slate-400">{utilPct}% full</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Stops */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {r.stops.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-600">
                            <FontAwesomeIcon icon={faLocationDot} className="text-[9px] text-slate-400" />
                            {s}
                          </span>
                        ))}
                      </div>
                      {/* Driver */}
                      <p className="text-[12px] text-slate-500">
                        Driver: <span className="font-medium text-slate-700">{r.driver}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        {r.phone}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          {/* Students tab */}
          <TabsContent value="students" className="mt-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">Students Using Transport</CardTitle>
                  <Button size="sm" className="bg-[#007BFF] hover:bg-[#0069d9] text-white text-[13px] h-8 gap-1.5">
                    <FontAwesomeIcon icon={faPlus} className="text-[12px]" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      {["Student", "Class", "Route", "Pickup Stop", "Status"].map((h) => (
                        <TableHead
                          key={h}
                          className={`text-[11px] font-semibold uppercase text-slate-500 ${h === "Student" ? "pl-6" : ""} ${h === "Status" ? "pr-6" : ""}`}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {STUDENT_TRANSPORT.map((s) => (
                      <TableRow key={s.name} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="text-[13px] font-medium text-slate-900 pl-6">{s.name}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{s.class}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{s.route}</TableCell>
                        <TableCell className="text-[13px] text-slate-600">{s.pickup}</TableCell>
                        <TableCell className="pr-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusCls[s.status]}`}>
                            {s.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
