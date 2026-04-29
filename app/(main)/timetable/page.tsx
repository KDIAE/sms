"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ─────────────────────────────────────────────────────────────────────

type Slot = { subject: string; teacher: string; colorKey: string } | null;
type DaySchedule = Record<string, Slot>;
type Timetable = Record<string, DaySchedule>;

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const SCHOOL_START = 8 * 60;       // 480 min
const SCHOOL_END   = 13 * 60 + 30; // 810 min
const TOTAL_MINS   = SCHOOL_END - SCHOOL_START; // 330 min

type Period = {
  id: string;
  label: string;
  time: string;
  startMin: number;
  durationMin: number;
  isBreak?: boolean;
};

const PERIODS: Period[] = [
  { id: "P1",   label: "Period 1", time: "8:00 – 8:45",   startMin: 0,   durationMin: 45 },
  { id: "P2",   label: "Period 2", time: "8:45 – 9:30",   startMin: 45,  durationMin: 45 },
  { id: "BRK1", label: "Break",    time: "9:30 – 9:45",   startMin: 90,  durationMin: 15, isBreak: true },
  { id: "P3",   label: "Period 3", time: "9:45 – 10:30",  startMin: 105, durationMin: 45 },
  { id: "P4",   label: "Period 4", time: "10:30 – 11:15", startMin: 150, durationMin: 45 },
  { id: "LCH",  label: "Lunch",    time: "11:15 – 12:00", startMin: 195, durationMin: 45, isBreak: true },
  { id: "P5",   label: "Period 5", time: "12:00 – 12:45", startMin: 240, durationMin: 45 },
  { id: "P6",   label: "Period 6", time: "12:45 – 1:30",  startMin: 285, durationMin: 45 },
];

const SUBJECT_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Mathematics:      { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-800",    dot: "bg-blue-400"    },
  Science:          { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-400" },
  English:          { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-800",  dot: "bg-violet-400"  },
  "Social Studies": { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   dot: "bg-amber-400"   },
  Hindi:            { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-800",    dot: "bg-rose-400"    },
  "Computer Sc.":   { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-800",    dot: "bg-cyan-400"    },
  "Phys. Ed.":      { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-800",  dot: "bg-orange-400"  },
  Art:              { bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-800",    dot: "bg-pink-400"    },
};

const C = (key: string) => SUBJECT_STYLES[key] ?? SUBJECT_STYLES["Mathematics"];

// ── Timetable Data ────────────────────────────────────────────────────────────

const INITIAL_DATA: Record<string, Timetable> = {
  "Class 6": {
    Monday:    { P1: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P2: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P3: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P4: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  }, P5: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P6: { subject: "Art",            teacher: "D. Roy",        colorKey: "Art"             } },
    Tuesday:   { P1: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P2: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P3: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P4: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P5: { subject: "Computer Sc.",   teacher: "N. Chatterjee", colorKey: "Computer Sc."    }, P6: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  } },
    Wednesday: { P1: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P2: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  }, P3: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P4: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P5: { subject: "Art",            teacher: "D. Roy",        colorKey: "Art"             }, P6: { subject: "Phys. Ed.",      teacher: "K. Sen",        colorKey: "Phys. Ed."       } },
    Thursday:  { P1: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P2: { subject: "Computer Sc.",   teacher: "N. Chatterjee", colorKey: "Computer Sc."    }, P3: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P4: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P5: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P6: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  } },
    Friday:    { P1: { subject: "Computer Sc.",   teacher: "N. Chatterjee", colorKey: "Computer Sc."    }, P2: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P3: { subject: "Phys. Ed.",      teacher: "K. Sen",        colorKey: "Phys. Ed."       }, P4: { subject: "Art",            teacher: "D. Roy",        colorKey: "Art"             }, P5: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P6: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         } },
  },
  "Class 5": {
    Monday:    { P1: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P2: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P3: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P4: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P5: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  }, P6: { subject: "Phys. Ed.",      teacher: "K. Sen",        colorKey: "Phys. Ed."       } },
    Tuesday:   { P1: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P2: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P3: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P4: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P5: { subject: "Art",            teacher: "D. Roy",        colorKey: "Art"             }, P6: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  } },
    Wednesday: { P1: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P2: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  }, P3: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           }, P4: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P5: { subject: "Computer Sc.",   teacher: "N. Chatterjee", colorKey: "Computer Sc."    }, P6: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         } },
    Thursday:  { P1: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  }, P2: { subject: "Science",        teacher: "S. Das",        colorKey: "Science"         }, P3: { subject: "Art",            teacher: "D. Roy",        colorKey: "Art"             }, P4: { subject: "Computer Sc.",   teacher: "N. Chatterjee", colorKey: "Computer Sc."    }, P5: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P6: { subject: "Hindi",          teacher: "M. Gupta",      colorKey: "Hindi"           } },
    Friday:    { P1: { subject: "English",        teacher: "P. Mukherjee",  colorKey: "English"         }, P2: { subject: "Art",            teacher: "D. Roy",        colorKey: "Art"             }, P3: { subject: "Social Studies", teacher: "A. Bose",       colorKey: "Social Studies"  }, P4: { subject: "Mathematics",    teacher: "R. Sharma",     colorKey: "Mathematics"     }, P5: { subject: "Phys. Ed.",      teacher: "K. Sen",        colorKey: "Phys. Ed."       }, P6: { subject: "Computer Sc.",   teacher: "N. Chatterjee", colorKey: "Computer Sc."    } },
  },
};

const CLASSES = ["Nursery", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"];

function getFallback(cls: string): Timetable {
  return INITIAL_DATA[cls] ?? INITIAL_DATA["Class 6"];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowToMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() - SCHOOL_START;
}

function minsToLabel(absMin: number): string {
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

interface DragState {
  periodId: string;
  day: string;
  slot: NonNullable<Slot>;
}

// ── Time Ruler ────────────────────────────────────────────────────────────────

function TimeRuler({ simMins }: { simMins: number }) {
  const pct = Math.max(0, Math.min(100, (simMins / TOTAL_MINS) * 100));
  const inSchool = simMins >= 0 && simMins <= TOTAL_MINS;
  const currentLabel = minsToLabel(SCHOOL_START + Math.max(0, Math.min(TOTAL_MINS, simMins)));

  const ticks = PERIODS.map(p => ({
    id: p.id,
    pct: (p.startMin / TOTAL_MINS) * 100,
    label: minsToLabel(SCHOOL_START + p.startMin),
    isBreak: p.isBreak,
  }));

  return (
    <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-white select-none">
      <div className="flex items-center gap-3">
        {/* Time pill */}
        <div
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tabular-nums shadow-sm border transition-all ${
            inSchool
              ? "bg-[#007BFF] text-white border-[#0062cc]"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${inSchool ? "bg-white animate-pulse" : "bg-slate-300"}`} />
          {currentLabel}
        </div>

        {/* Ruler track */}
        <div className="relative flex-1 h-7 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full" />

          {/* Filled track */}
          {inSchool && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#007BFF]/30 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          )}

          {/* Tick marks */}
          {ticks.map(t => (
            <div
              key={t.id}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${t.pct}%`, transform: "translateX(-50%)" }}
            >
              <div className={`w-px h-2 mt-1.5 ${t.isBreak ? "bg-slate-200" : "bg-slate-300"}`} />
              <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap mt-0.5">{t.label}</span>
            </div>
          ))}

          {/* End tick */}
          <div className="absolute top-0 right-0 flex flex-col items-center" style={{ transform: "translateX(50%)" }}>
            <div className="w-px h-2 mt-1.5 bg-slate-300" />
            <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap mt-0.5">{minsToLabel(SCHOOL_END)}</span>
          </div>

          {/* Now marker dot */}
          {inSchool && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#007BFF] rounded-full ring-2 ring-white shadow transition-all duration-1000 z-10"
              style={{ left: `${pct}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("Class 6");
  const [timetables, setTimetables] = useState<Record<string, Timetable>>(
    Object.fromEntries(CLASSES.map(c => [c, getFallback(c)]))
  );
  const [simMins, setSimMins] = useState<number>(nowToMinutes());
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<{ periodId: string; day: string } | null>(null);
  const [activeDay, setActiveDay] = useState<string>("Monday");

  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const data = timetables[selectedClass] ?? getFallback(selectedClass);

  // Default activeDay to today if it's a weekday
  useEffect(() => {
    if (DAYS.includes(todayName)) setActiveDay(todayName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSimMins(nowToMinutes()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleDragStart = useCallback((periodId: string, day: string, slot: NonNullable<Slot>) => {
    setDragState({ periodId, day, slot });
  }, []);

  const handleDrop = useCallback((targetPeriodId: string, targetDay: string) => {
    if (!dragState) return;
    const { periodId: srcPeriodId, day: srcDay } = dragState;
    if (srcPeriodId === targetPeriodId && srcDay === targetDay) {
      setDragState(null); setDropTarget(null); return;
    }
    setTimetables(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as typeof prev;
      const srcSlot = next[selectedClass][srcDay][srcPeriodId];
      const tgtSlot = next[selectedClass][targetDay][targetPeriodId];
      next[selectedClass][srcDay][srcPeriodId] = tgtSlot ?? null;
      next[selectedClass][targetDay][targetPeriodId] = srcSlot;
      return next;
    });
    setDragState(null); setDropTarget(null);
  }, [dragState, selectedClass]);

  const handleDeleteSlot = useCallback((periodId: string, day: string) => {
    setTimetables(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as typeof prev;
      next[selectedClass][day][periodId] = null;
      return next;
    });
  }, [selectedClass]);

  const handleAddSlot = useCallback((periodId: string, day: string, subject: string, teacher: string) => {
    setTimetables(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as typeof prev;
      if (!next[selectedClass][day]) next[selectedClass][day] = {};
      next[selectedClass][day][periodId] = { subject, teacher, colorKey: subject };
      return next;
    });
  }, [selectedClass]);

  const sharedProps = {
    data, periods: PERIODS, simMins, dragState, dropTarget,
    onDragStart: handleDragStart, onDrop: handleDrop,
    onDragOver: setDropTarget,
    onDragEnd: () => { setDragState(null); setDropTarget(null); },
    onDelete: handleDeleteSlot,
    onAdd: handleAddSlot,
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Tabs defaultValue="week" className="gap-0">
          {/* Controls row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
              {/* Day selector shown in day tab */}
              <TabsContent value="day" className="mt-0 flex-none">
                <Tabs value={activeDay} onValueChange={setActiveDay}>
                  <TabsList>
                    {DAYS.map((d, i) => {
                      const isToday = d === todayName;
                      const isActive = d === activeDay;
                      return (
                        <TabsTrigger
                          key={d}
                          value={d}
                          className={!isActive && isToday ? "text-[#007BFF] font-semibold" : ""}
                        >
                          <span className="flex items-center gap-1">
                            {DAY_SHORT[i]}
                            {isToday && !isActive && (
                              <span className="w-1 h-1 rounded-full bg-[#007BFF] inline-block" />
                            )}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </TabsContent>
            </div>
            <div className="flex items-center gap-2">
              {dragState && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-[12px] text-amber-700 font-medium animate-pulse">
                  <span>Dragging: {dragState.slot.subject}</span>
                  <span className="opacity-60">→ drop to swap</span>
                </div>
              )}
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-36 bg-white border-slate-200 text-[13px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map(c => (
                    <SelectItem key={c} value={c} className="text-[13px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Timetable card */}
          <Card className="shadow-none border-slate-200 overflow-hidden">
            <TimeRuler simMins={simMins} />
            <TabsContent value="week" className="mt-0">
              <WeekView {...sharedProps} days={DAYS} todayName={todayName} />
            </TabsContent>
            <TabsContent value="day" className="mt-0">
              <DayView {...sharedProps} day={activeDay} isToday={activeDay === todayName} />
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({
  data, periods, days, simMins, todayName,
  dragState, dropTarget, onDragStart, onDrop, onDragOver, onDragEnd, onDelete, onAdd,
}: {
  data: Timetable; periods: Period[]; days: string[]; simMins: number; todayName: string;
  dragState: DragState | null; dropTarget: { periodId: string; day: string } | null;
  onDragStart: (p: string, d: string, s: NonNullable<Slot>) => void;
  onDrop: (p: string, d: string) => void;
  onDragOver: (t: { periodId: string; day: string } | null) => void;
  onDragEnd: () => void;
  onDelete: (periodId: string, day: string) => void;
  onAdd: (periodId: string, day: string, subject: string, teacher: string) => void;
}) {
  const inSchool = simMins >= 0 && simMins <= TOTAL_MINS;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="py-3 px-4 text-left w-32">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Time</span>
            </th>
            {days.map(d => (
              <th key={d} className={`py-3 px-2 text-center ${d === todayName ? "bg-blue-50/60" : ""}`}>
                <div className={`text-[12px] font-semibold ${d === todayName ? "text-[#007BFF]" : "text-slate-600"}`}>{d}</div>
                {d === todayName && <div className="text-[10px] text-[#007BFF]/70">Today</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map(p => {
            const isCurrentPeriod = !p.isBreak && simMins >= p.startMin && simMins < p.startMin + p.durationMin;
            const showNowLine = inSchool && simMins >= p.startMin && simMins < p.startMin + p.durationMin;
            const nowLinePct = showNowLine ? ((simMins - p.startMin) / p.durationMin) * 100 : 0;

            return (
              <tr
                key={p.id}
                className={`border-b border-slate-100 transition-colors ${
                  isCurrentPeriod ? "bg-blue-50/40" : p.isBreak ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                }`}
              >
                {/* Period label */}
                <td className="py-2 px-4 relative">
                  {showNowLine && (
                    <div
                      className="absolute left-17 right-0 flex items-center gap-1 z-20 pointer-events-none"
                      style={{ top: `${nowLinePct}%`, transform: "translateY(-50%)" }}
                    >
                      <span className="bg-[#007BFF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums shadow-sm whitespace-nowrap">
                        {minsToLabel(SCHOOL_START + simMins)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {isCurrentPeriod && <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-pulse shrink-0" />}
                    <div>
                      <p className={`text-[12px] font-semibold ${isCurrentPeriod ? "text-[#007BFF]" : "text-slate-700"}`}>{p.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.time}</p>
                    </div>
                  </div>
                </td>

                {/* Slots */}
                {p.isBreak
                  ? days.map(d => (
                      <td key={d} className={`py-2 px-2 text-center relative ${d === todayName ? "bg-blue-50/30" : ""}`}>
                        {showNowLine && (
                          <div
                            className="absolute inset-x-0 h-0.5 bg-[#007BFF] z-10 pointer-events-none"
                            style={{ top: `${nowLinePct}%` }}
                          />
                        )}
                        <span className="text-[11px] text-slate-400 italic">{p.label}</span>
                      </td>
                    ))
                  : days.map(d => {
                      const slot = data[d]?.[p.id];
                      const isDragSource = dragState?.periodId === p.id && dragState?.day === d;
                      const isDropTarget = dropTarget?.periodId === p.id && dropTarget?.day === d;
                      return (
                        <td
                          key={d}
                          className={`py-1.5 px-2 relative ${d === todayName ? "bg-blue-50/20" : ""}`}
                          onDragOver={e => { e.preventDefault(); onDragOver({ periodId: p.id, day: d }); }}
                          onDrop={e => { e.preventDefault(); onDrop(p.id, d); }}
                        >
                          {showNowLine && (
                            <div
                              className="absolute inset-x-0 h-0.5 bg-[#007BFF] z-10 pointer-events-none"
                              style={{ top: `${nowLinePct}%` }}
                            />
                          )}
                          <SlotCard
                            slot={slot}
                            isDragSource={isDragSource}
                            isDropTarget={isDropTarget}
                            onDragStart={() => slot && onDragStart(p.id, d, slot)}
                            onDragEnd={onDragEnd}
                            onDelete={() => onDelete(p.id, d)}
                            onAdd={(subject, teacher) => onAdd(p.id, d, subject, teacher)}
                          />
                        </td>
                      );
                    })
                }
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Day View ──────────────────────────────────────────────────────────────────

function DayView({
  data, periods, day, simMins, isToday,
  dragState, dropTarget, onDragStart, onDrop, onDragOver, onDragEnd, onDelete, onAdd,
}: {
  data: Timetable; periods: Period[]; day: string; simMins: number; isToday: boolean;
  dragState: DragState | null; dropTarget: { periodId: string; day: string } | null;
  onDragStart: (p: string, d: string, s: NonNullable<Slot>) => void;
  onDrop: (p: string, d: string) => void;
  onDragOver: (t: { periodId: string; day: string } | null) => void;
  onDragEnd: () => void;
  onDelete: (periodId: string, day: string) => void;
  onAdd: (periodId: string, day: string, subject: string, teacher: string) => void;
}) {
  // 2px per minute
  const PX_PER_MIN = 2;
  const totalH = TOTAL_MINS * PX_PER_MIN;

  // Hour grid lines: 8:00, 9:00, 10:00, 11:00, 12:00, 13:00, 13:30
  const hourTicks: { label: string; offsetMin: number }[] = [];
  for (let m = SCHOOL_START; m <= SCHOOL_END; m += 60) {
    hourTicks.push({ label: minsToLabel(m), offsetMin: m - SCHOOL_START });
  }
  if (hourTicks[hourTicks.length - 1].offsetMin < TOTAL_MINS) {
    hourTicks.push({ label: minsToLabel(SCHOOL_END), offsetMin: TOTAL_MINS });
  }

  const inSchool = simMins >= 0 && simMins <= TOTAL_MINS;
  const nowTop = simMins * PX_PER_MIN;

  return (
    <div className="p-4">
      {/* Day header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[15px] font-semibold text-slate-800">{day}</h3>
        {isToday && <Badge className="bg-blue-50 text-[#007BFF] border-blue-200 text-[10px] font-semibold px-2 py-0.5">Today</Badge>}
      </div>

      {/* Timeline */}
      <div className="flex gap-0">
        {/* Left ruler */}
        <div className="relative shrink-0 w-16 mr-3" style={{ height: totalH }}>
          {hourTicks.map(tick => (
            <div
              key={tick.label}
              className="absolute right-0 flex items-center justify-end"
              style={{ top: tick.offsetMin * PX_PER_MIN }}
            >
              <span className="text-[10px] text-slate-400 font-mono tabular-nums leading-none -translate-y-1/2">
                {tick.label}
              </span>
            </div>
          ))}
          {/* Now pill on ruler */}
          {isToday && inSchool && (
            <div
              className="absolute -right-3 z-20"
              style={{ top: nowTop }}
            >
              <span className="flex items-center gap-1 bg-[#007BFF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums shadow-sm -translate-y-1/2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse shrink-0" />
                {minsToLabel(SCHOOL_START + simMins)}
              </span>
            </div>
          )}
        </div>

        {/* Grid + events */}
        <div
          className="relative flex-1 rounded-xl overflow-hidden"
          style={{ height: totalH }}
          onDragOver={e => e.preventDefault()}
        >
          {/* Hour gridlines */}
          {hourTicks.map(tick => (
            <div
              key={tick.label}
              className="absolute inset-x-0 h-px bg-slate-100"
              style={{ top: tick.offsetMin * PX_PER_MIN }}
            />
          ))}

          {/* Break bands */}
          {periods.filter(p => p.isBreak).map(p => (
            <div
              key={p.id}
              className="absolute inset-x-0 bg-slate-50 border-y border-slate-100 flex items-center px-3"
              style={{
                top: p.startMin * PX_PER_MIN,
                height: p.durationMin * PX_PER_MIN,
              }}
            >
              <span className="text-[10px] text-slate-400 italic">{p.label}</span>
            </div>
          ))}

          {/* Period cards */}
          {periods.filter(p => !p.isBreak).map(p => {
            const slot = data[day]?.[p.id];
            const isDragSource = dragState?.periodId === p.id && dragState?.day === day;
            const isDropTarget = dropTarget?.periodId === p.id && dropTarget?.day === day;
            const cardTop = p.startMin * PX_PER_MIN;
            const cardH = p.durationMin * PX_PER_MIN;

            return (
              <div
                key={p.id}
                className="absolute inset-x-0 px-1 py-0.5"
                style={{ top: cardTop, height: cardH }}
                onDragOver={e => { e.preventDefault(); onDragOver({ periodId: p.id, day }); }}
                onDrop={e => { e.preventDefault(); onDrop(p.id, day); }}
              >
                <div className="h-full">
                  <SlotCard
                    slot={slot}
                    isDragSource={isDragSource}
                    isDropTarget={isDropTarget}
                    onDragStart={() => slot && onDragStart(p.id, day, slot)}
                    onDragEnd={onDragEnd}
                    large
                    periodLabel={p.label}
                    periodTime={p.time}
                    fillHeight
                    onDelete={() => onDelete(p.id, day)}
                    onAdd={(subject, teacher) => onAdd(p.id, day, subject, teacher)}
                  />
                </div>
              </div>
            );
          })}

          {/* Now line */}
          {isToday && inSchool && (
            <div
              className="absolute inset-x-0 h-px bg-[#007BFF] z-10 pointer-events-none"
              style={{ top: nowTop }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Slot Card ─────────────────────────────────────────────────────────────────

const SUBJECT_LIST = Object.keys(SUBJECT_STYLES);

function SlotCard({
  slot, isDragSource, isDropTarget, onDragStart, onDragEnd, large, periodLabel, periodTime, fillHeight,
  onDelete, onAdd,
}: {
  slot: Slot; isDragSource: boolean; isDropTarget: boolean;
  onDragStart: () => void; onDragEnd: () => void;
  large?: boolean; periodLabel?: string; periodTime?: string; fillHeight?: boolean;
  onDelete?: () => void;
  onAdd?: (subject: string, teacher: string) => void;
}) {
  const [addSubject, setAddSubject] = useState(SUBJECT_LIST[0]);
  const [addTeacher, setAddTeacher] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  if (!slot) {
    return (
      <Popover open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger asChild>
          <div
            className={`group rounded-xl border border-dashed transition-all flex items-center justify-center cursor-pointer ${
              isDropTarget ? "border-[#007BFF] bg-blue-50/60" : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/60"
            } ${fillHeight ? "h-full" : large ? "h-14" : "h-12"}`}
            onDragOver={e => e.preventDefault()}
          >
            {isDropTarget ? (
              <p className="text-[#007BFF] text-[11px] font-medium">Drop here</p>
            ) : (
              <div className="flex items-center gap-1 opacity-30 group-hover:opacity-60 transition-opacity">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
                  <line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/>
                </svg>
                {fillHeight && <span className="text-[11px] text-slate-400 font-medium">Add class</span>}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="center" side="right">
          <p className="text-[13px] font-semibold text-slate-800 mb-1">Add Class</p>
          {periodLabel && <p className="text-[11px] text-slate-400 mb-3">{periodLabel}{periodTime ? ` · ${periodTime}` : ""}</p>}
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Subject</label>
              <Select value={addSubject} onValueChange={setAddSubject}>
                <SelectTrigger className="h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_LIST.map(s => (
                    <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Teacher</label>
              <Input
                className="h-8 text-[12px]"
                placeholder="e.g. R. Sharma"
                value={addTeacher}
                onChange={e => setAddTeacher(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="w-full mt-1 bg-[#007BFF] hover:bg-[#0062cc] text-[12px]"
              disabled={!addTeacher.trim()}
              onClick={() => {
                onAdd?.(addSubject, addTeacher.trim());
                setAddTeacher("");
                setAddOpen(false);
              }}
            >
              Add Class
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  const s = C(slot.colorKey);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          draggable
          onDragStart={e => { e.stopPropagation(); onDragStart(); }}
          onDragEnd={onDragEnd}
          className={`group relative rounded-xl cursor-pointer select-none transition-all shadow-xs overflow-hidden ${s.bg} border ${s.border} ${
            isDragSource
              ? "opacity-40 scale-95"
              : isDropTarget
              ? "ring-2 ring-[#007BFF] scale-[1.02] shadow-md"
              : "hover:brightness-95"
          } ${fillHeight ? "h-full" : large ? "min-h-[3.5rem]" : "min-h-[3rem]"}`}
        >
          <div className={`flex ${fillHeight ? "flex-col justify-start px-3 pt-2 pb-2 h-full" : `items-center gap-2 ${large ? "px-3 py-2" : "px-2.5 py-1.5"}`}`}>
            {fillHeight ? (
              <>
                {/* Time range at top */}
                {periodTime && (
                  <p className={`text-[10px] font-medium leading-none mb-1.5 ${s.text} opacity-70`}>{periodTime}</p>
                )}
                {/* Subject */}
                <p className={`font-semibold leading-snug ${s.text} text-[13px]`}>{slot.subject}</p>
                {/* Teacher */}
                <p className={`${s.text} opacity-60 text-[11px] mt-0.5`}>{slot.teacher}</p>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  {/* Time at top for large cards */}
                  {large && periodTime && (
                    <p className={`text-[10px] font-medium leading-none mb-1 ${s.text} opacity-70`}>{periodTime}</p>
                  )}
                  <p className={`font-semibold leading-tight truncate ${s.text} ${large ? "text-[12px]" : "text-[11px]"}`}>
                    {slot.subject}
                  </p>
                  <p className={`truncate mt-0.5 ${s.text} opacity-60 ${large ? "text-[11px]" : "text-[10px]"}`}>
                    {slot.teacher}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="center" side="right">
        {/* Detail header */}
        <div className="flex items-start gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${s.dot}`} />
          <div>
            <p className="text-[14px] font-semibold text-slate-800 leading-tight">{slot.subject}</p>
            <p className="text-[12px] text-slate-500 mt-0.5">{slot.teacher}</p>
          </div>
        </div>
        {(periodLabel || periodTime) && (
          <div className="flex items-center gap-1.5 mb-3 bg-slate-50 rounded-lg px-2.5 py-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400 shrink-0">
              <circle cx="6" cy="6" r="4.5"/><polyline points="6,3.5 6,6 7.5,7.5"/>
            </svg>
            <span className="text-[11px] text-slate-500 font-mono">{periodLabel}{periodTime ? ` · ${periodTime}` : ""}</span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-[12px] text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={() => onDelete?.()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1.5">
            <polyline points="2,3 10,3"/><path d="M4,3V2h4v1"/><path d="M3,3l.7,7.3a.7.7 0 0 0 .7.7h3.2a.7.7 0 0 0 .7-.7L9,3"/>
          </svg>
          Remove Class
        </Button>
      </PopoverContent>
    </Popover>
  );
}
