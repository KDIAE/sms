/**
 * Typed API client for the KDIAE SMS backend.
 * All calls attach the in-memory access token and auto-retry once via
 * silent refresh if the server returns 401.
 */
import { getValidToken, silentRefresh, clearSession } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeeInfo {
  // monthly recurring
  tuition_fee: number;
  concession_amount: number;
  concession_reason: string;
  transport_fee: number;
  other_monthly_fee: number;
  // one-time
  admission_fee: number;
  admission_fee_paid: number;
  book_fee: number;
  book_fee_paid: number;
  uniform_fee: number;
  uniform_fee_paid: number;
  // overall
  fee_status: string;
}

export interface Guardian {
  name: string;
  relation: string;
  phone: string;
  email: string;
  address: string;
  id_type: string;
  id_number: string;
  occupation: string;
}

export interface Guardian2 {
  name: string;
  relation: string;
  phone: string;
  email: string;
  id_type: string;
  id_number: string;
}

export interface Student {
  id: string;
  student_code: string;
  name: string;
  dob: string;
  gender: string;
  blood_group: string;
  class_name: string;
  section: string;
  roll_no: string;
  admission_date: string;
  phone: string;
  email: string;
  address: string;
  previous_school: string;
  tc_number: string;
  cc_number: string;
  student_id_type: string;
  student_id_number: string;
  fees: FeeInfo;
  attendance: number;
  is_active: boolean;
  guardian: Guardian;
  guardian2: Guardian2;
}

export interface StudentListResponse {
  total: number;
  page: number;
  limit: number;
  data: Student[];
}

export interface StudentStats {
  total: number;
  fee_paid: number;
  fee_issues: number;
  low_attendance: number;
}

export interface Class {
  id: string;
  class_code?: string;
  name: string;
  teacher: string;
  sections: string[];
  subjects: string[];
  student_count: number;
  status: string;       // active | pending | rejected
  submitted_by: string;
}

export interface ClassStats {
  total_classes: number;
  total_sections: number;
  total_students: number;
  total_subjects: number;
}

// ── Core fetcher ──────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = await getValidToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && retry) {
    // Try one silent refresh then retry
    const newToken = await silentRefresh();
    if (!newToken) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
    return apiFetch<T>(path, options, false);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (!res.ok) throw new Error(json?.detail ?? `API error ${res.status}`);
  return json as T;
}

// ── Students ──────────────────────────────────────────────────────────────────

export interface StudentListParams {
  search?: string;
  class_name?: string;
  section?: string;
  fee?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const studentsApi = {
  list(params: StudentListParams = {}): Promise<StudentListResponse> {
    const q = new URLSearchParams();
    if (params.search)     q.set("search",     params.search);
    if (params.class_name) q.set("class_name", params.class_name);
    if (params.section)    q.set("section",    params.section);
    if (params.fee)        q.set("fee",        params.fee);
    if (params.status)     q.set("status",     params.status);
    if (params.page)       q.set("page",       String(params.page));
    if (params.limit)      q.set("limit",      String(params.limit));
    return apiFetch<StudentListResponse>(`/api/students?${q}`);
  },

  stats(): Promise<StudentStats> {
    return apiFetch<StudentStats>("/api/students/stats");
  },

  create(body: Omit<Student, "id" | "student_code">): Promise<Student> {
    return apiFetch<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<Omit<Student, "id" | "student_code">>): Promise<Student> {
    return apiFetch<Student>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  setActive(id: string, is_active: boolean): Promise<Student> {
    return apiFetch<Student>(`/api/students/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/students/${id}`, { method: "DELETE" });
  },
};

// ── Admissions ───────────────────────────────────────────────────────────────

export interface Admission {
  id: string;
  application_code: string;
  applicant_name: string;
  dob: string;
  gender: string;
  blood_group: string;
  applying_for_class: string;
  section_preference: string;
  academic_year: string;
  phone: string;
  email: string;
  address: string;
  previous_school: string;
  tc_number: string;
  cc_number: string;
  student_id_type: string;
  student_id_number: string;
  status: string;
  remarks: string;
  applied_date: string;
  fees: FeeInfo;
  guardian: Guardian;
}

export interface AdmissionListResponse {
  total: number;
  page: number;
  limit: number;
  data: Admission[];
}

export interface AdmissionStats {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  enrolled: number;
}

export interface AdmissionListParams {
  search?: string;
  status?: string;
  class_name?: string;
  page?: number;
  limit?: number;
}

export const admissionsApi = {
  list(params: AdmissionListParams = {}): Promise<AdmissionListResponse> {
    const q = new URLSearchParams();
    if (params.search)     q.set("search",     params.search);
    if (params.status)     q.set("status",     params.status);
    if (params.class_name) q.set("class_name", params.class_name);
    if (params.page)       q.set("page",       String(params.page));
    if (params.limit)      q.set("limit",      String(params.limit));
    return apiFetch<AdmissionListResponse>(`/api/admissions?${q}`);
  },

  stats(): Promise<AdmissionStats> {
    return apiFetch<AdmissionStats>("/api/admissions/stats");
  },

  create(body: Omit<Admission, "id" | "application_code">): Promise<Admission> {
    return apiFetch<Admission>("/api/admissions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<Omit<Admission, "id" | "application_code">>): Promise<Admission> {
    return apiFetch<Admission>(`/api/admissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/admissions/${id}`, { method: "DELETE" });
  },

  enroll(id: string): Promise<{ student_code: string; message: string }> {
    return apiFetch(`/api/admissions/${id}/enroll`, { method: "POST" });
  },
};

// ── Classes ───────────────────────────────────────────────────────────────────

export const classesApi = {
  list(signal?: AbortSignal): Promise<Class[]> {
    return apiFetch<Class[]>("/api/classes", { signal });
  },

  stats(): Promise<ClassStats> {
    return apiFetch<ClassStats>("/api/classes/stats");
  },

  create(body: Omit<Class, "id" | "student_count" | "class_code" | "status" | "submitted_by">): Promise<Class> {
    return apiFetch<Class>("/api/classes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<Omit<Class, "id" | "student_count" | "class_code" | "status" | "submitted_by">>): Promise<Class> {
    return apiFetch<Class>(`/api/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/classes/${id}`, { method: "DELETE" });
  },

  approve(id: string): Promise<Class> {
    return apiFetch<Class>(`/api/classes/${id}/approve`, { method: "PATCH" });
  },

  reject(id: string): Promise<Class> {
    return apiFetch<Class>(`/api/classes/${id}/reject`, { method: "PATCH" });
  },
};

// ── Subjects ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  subject_uid: string;   // e.g. SUB001
  name: string;
  code: string;
  description: string;
  status: string;        // active | pending | rejected
  submitted_by: string;
}

export const subjectsApi = {
  list(signal?: AbortSignal): Promise<Subject[]> {
    return apiFetch<Subject[]>("/api/subjects", { signal });
  },
  create(body: Omit<Subject, "id" | "subject_uid" | "status" | "submitted_by">): Promise<Subject> {
    return apiFetch<Subject>("/api/subjects", { method: "POST", body: JSON.stringify(body) });
  },
  update(id: string, body: Partial<Omit<Subject, "id" | "subject_uid" | "status" | "submitted_by">>): Promise<Subject> {
    return apiFetch<Subject>(`/api/subjects/${id}`, { method: "PUT", body: JSON.stringify(body) });
  },
  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/subjects/${id}`, { method: "DELETE" });
  },
  approve(id: string): Promise<Subject> {
    return apiFetch<Subject>(`/api/subjects/${id}/approve`, { method: "PATCH" });
  },
  reject(id: string): Promise<Subject> {
    return apiFetch<Subject>(`/api/subjects/${id}/reject`, { method: "PATCH" });
  },
};

// ── Timetable ─────────────────────────────────────────────────────────────────

export interface TimetableEntry {
  id: string;
  teacher_email: string;
  teacher: string;
  period: string;
  day: string;
  subject: string;
  class_name: string;
  color: string;
}

export interface TimetableEntryCreate {
  teacher_email: string;
  teacher: string;
  period: string;
  day: string;
  subject: string;
  class_name: string;
  color?: string;
}

export const timetableApi = {
  listByClass(className: string): Promise<TimetableEntry[]> {
    return apiFetch<TimetableEntry[]>(
      `/api/timetable?class_name=${encodeURIComponent(className)}`
    );
  },

  create(body: TimetableEntryCreate): Promise<TimetableEntry> {
    return apiFetch<TimetableEntry>("/api/timetable", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/timetable/${id}`, { method: "DELETE" });
  },

  update(id: string, body: Partial<TimetableEntryCreate>): Promise<TimetableEntry> {
    return apiFetch<TimetableEntry>(`/api/timetable/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};

// ── Schedule ──────────────────────────────────────────────────────────────────

export interface PeriodDef {
  id: string;
  label: string;
  time_start: string;  // "HH:MM"
  time_end: string;    // "HH:MM"
  is_break: boolean;
  sort_order: number;
}

export interface SchedulePayload {
  periods: PeriodDef[];
}

export const scheduleApi = {
  get(className: string): Promise<SchedulePayload> {
    return apiFetch<SchedulePayload>(`/api/schedule?class_name=${encodeURIComponent(className)}`);
  },

  save(className: string, body: SchedulePayload): Promise<SchedulePayload> {
    return apiFetch<SchedulePayload>(`/api/schedule?class_name=${encodeURIComponent(className)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};

// ── Exams ────────────────────────────────────────────────────────────────────

export interface Exam {
  id: string;
  name: string;
  term: string;
  session: string;
  start_date: string;
  end_date: string;
  classes: string;
  status: string;
}

export interface SubjectMark {
  subject: string;
  marks: number;
  max_marks: number;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_name: string;
  student_id: string;
  class_name: string;
  marks: SubjectMark[];
  grade: string;
  remarks: string;
  total: number;
  percentage: number;
}

export interface GradeRule {
  grade: string;
  min_pct: number;
  max_pct: number;
  remark: string;
}

export interface GradingScale {
  rules: GradeRule[];
}

export interface CsvUploadSummary {
  exam_id: string;
  inserted: number;
  skipped: number;
  errors: string[];
}

export interface ExamCreatePayload {
  name: string;
  term: string;
  session: string;
  start_date: string;
  end_date: string;
  classes: string;
  status?: string;
}

export const examsApi = {
  list(status?: string): Promise<Exam[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiFetch<Exam[]>(`/api/exams${q}`);
  },

  create(body: ExamCreatePayload): Promise<Exam> {
    return apiFetch<Exam>("/api/exams", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<ExamCreatePayload>): Promise<Exam> {
    return apiFetch<Exam>(`/api/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  remove(id: string): Promise<void> {
    return apiFetch<void>(`/api/exams/${id}`, { method: "DELETE" });
  },

  results(examId: string, className?: string): Promise<ExamResult[]> {
    const q = className ? `?class_name=${encodeURIComponent(className)}` : "";
    return apiFetch<ExamResult[]>(`/api/exams/${examId}/results${q}`);
  },

  uploadResultsCsv(examId: string, file: File): Promise<CsvUploadSummary> {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<CsvUploadSummary>(`/api/exams/${examId}/results/upload-csv`, {
      method: "POST",
      body: form,
    });
  },

  grading(): Promise<GradingScale> {
    return apiFetch<GradingScale>("/api/exams/grading");
  },

  saveGrading(rules: GradeRule[]): Promise<GradingScale> {
    return apiFetch<GradingScale>("/api/exams/grading", {
      method: "PUT",
      body: JSON.stringify({ rules }),
    });
  },
};

// ── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceTrendPoint {
  month: string;
  overall: number;
  class3: number;
  class5: number;
  class6: number;
}

export interface ClassAttendanceItem {
  class_name: string;
  avg: number;
  total: number;
  present: number;
}

export interface DefaulterItem {
  name: string;
  class_name: string;
  attendance: number;
}

export interface DailyRecordItem {
  student: string;
  class_name: string;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
}

export interface AttendanceStats {
  overall_attendance: number;
  total_students: number;
  present_today: number;
  below_threshold: number;
}

export interface AttendanceDashboard {
  stats: AttendanceStats;
  monthly_trend: AttendanceTrendPoint[];
  class_attendance: ClassAttendanceItem[];
  defaulters: DefaulterItem[];
  daily_records: DailyRecordItem[];
}

export const attendanceApi = {
  dashboard(threshold = 75, dailyLimit = 50): Promise<AttendanceDashboard> {
    const q = new URLSearchParams();
    q.set("threshold", String(threshold));
    q.set("daily_limit", String(dailyLimit));
    return apiFetch<AttendanceDashboard>(`/api/attendance/dashboard?${q.toString()}`);
  },
};

// ── Transport ────────────────────────────────────────────────────────────────

export interface TransportRoute {
  id: string;
  name: string;
  bus: string;
  time: string;
  stops: string[];
  driver: string;
  phone: string;
  capacity: number;
  students: number;
}

export interface TransportStudent {
  id: string;
  name: string;
  class_name: string;
  status: string;
}

export interface TransportDashboard {
  routes: TransportRoute[];
  students: TransportStudent[];
}

export interface TransportDriver {
  id: string;
  name: string;
  phone: string;
  license: string;
  assigned_bus: string;
  status: string;
}

export interface TransportVehicle {
  id: string;
  bus_number: string;
  model: string;
  type: string;
  capacity: number;
  driver: string;
  status: string;
  last_service: string;
}

export const transportApi = {
  dashboard(): Promise<TransportDashboard> {
    return apiFetch<TransportDashboard>("/api/transport/dashboard");
  },

  listRoutes(): Promise<TransportRoute[]> {
    return apiFetch<TransportRoute[]>("/api/transport/routes");
  },

  createRoute(body: Omit<TransportRoute, "id">): Promise<TransportRoute> {
    return apiFetch<TransportRoute>("/api/transport/routes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateRoute(id: string, body: Partial<Omit<TransportRoute, "id">>): Promise<TransportRoute> {
    return apiFetch<TransportRoute>(`/api/transport/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteRoute(id: string): Promise<void> {
    return apiFetch<void>(`/api/transport/routes/${id}`, { method: "DELETE" });
  },

  listStudents(): Promise<TransportStudent[]> {
    return apiFetch<TransportStudent[]>("/api/transport/students");
  },

  createStudent(body: Omit<TransportStudent, "id">): Promise<TransportStudent> {
    return apiFetch<TransportStudent>("/api/transport/students", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateStudent(id: string, body: Partial<Omit<TransportStudent, "id">>): Promise<TransportStudent> {
    return apiFetch<TransportStudent>(`/api/transport/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteStudent(id: string): Promise<void> {
    return apiFetch<void>(`/api/transport/students/${id}`, { method: "DELETE" });
  },

  listDrivers(): Promise<TransportDriver[]> {
    return apiFetch<TransportDriver[]>("/api/transport/drivers");
  },

  createDriver(body: Omit<TransportDriver, "id">): Promise<TransportDriver> {
    return apiFetch<TransportDriver>("/api/transport/drivers", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateDriver(id: string, body: Partial<Omit<TransportDriver, "id">>): Promise<TransportDriver> {
    return apiFetch<TransportDriver>(`/api/transport/drivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteDriver(id: string): Promise<void> {
    return apiFetch<void>(`/api/transport/drivers/${id}`, { method: "DELETE" });
  },

  listVehicles(): Promise<TransportVehicle[]> {
    return apiFetch<TransportVehicle[]>("/api/transport/vehicles");
  },

  createVehicle(body: Omit<TransportVehicle, "id">): Promise<TransportVehicle> {
    return apiFetch<TransportVehicle>("/api/transport/vehicles", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateVehicle(id: string, body: Partial<Omit<TransportVehicle, "id">>): Promise<TransportVehicle> {
    return apiFetch<TransportVehicle>(`/api/transport/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteVehicle(id: string): Promise<void> {
    return apiFetch<void>(`/api/transport/vehicles/${id}`, { method: "DELETE" });
  },
};

// ── Gallery (Cloudflare R2) ─────────────────────────────────────────────────

export interface GalleryObject {
  key: string;
  size: number;
  last_modified: string | null;
  etag: string;
  url: string;
}

export interface GalleryFolder {
  prefix: string;
  name: string;
}

export interface GalleryList {
  prefix: string;
  folders: GalleryFolder[];
  files: GalleryObject[];
}

export interface GalleryPresignOut {
  key: string;
  url: string;
  method: string;
  expires_in: number;
}

export const galleryApi = {
  list(prefix = ""): Promise<GalleryList> {
    return apiFetch<GalleryList>(`/api/gallery/list?prefix=${encodeURIComponent(prefix)}`);
  },

  listObjects(prefix = "", limit = 200): Promise<GalleryObject[]> {
    return apiFetch<GalleryObject[]>(`/api/gallery/objects?prefix=${encodeURIComponent(prefix)}&limit=${limit}`);
  },

  createFolder(prefix: string): Promise<{ prefix: string; marker: string }> {
    return apiFetch<{ prefix: string; marker: string }>("/api/gallery/folders", {
      method: "POST",
      body: JSON.stringify({ prefix }),
    });
  },

  renameFolder(oldPrefix: string, newPrefix: string): Promise<{ moved: number; old_prefix: string; new_prefix: string }> {
    return apiFetch<{ moved: number; old_prefix: string; new_prefix: string }>("/api/gallery/folders/rename", {
      method: "PATCH",
      body: JSON.stringify({ old_prefix: oldPrefix, new_prefix: newPrefix }),
    });
  },

  deleteFolder(prefix: string): Promise<{ deleted: number; prefix: string }> {
    return apiFetch<{ deleted: number; prefix: string }>(`/api/gallery/folders?prefix=${encodeURIComponent(prefix)}&recursive=true`, {
      method: "DELETE",
    });
  },

  presignUpload(key: string, contentType: string, expiresIn = 900): Promise<GalleryPresignOut> {
    return apiFetch<GalleryPresignOut>("/api/gallery/files/presign-upload", {
      method: "POST",
      body: JSON.stringify({ key, content_type: contentType, expires_in: expiresIn }),
    });
  },

  presignDownload(key: string, expiresIn = 900): Promise<GalleryPresignOut> {
    return apiFetch<GalleryPresignOut>(`/api/gallery/files/presign-download?key=${encodeURIComponent(key)}&expires_in=${expiresIn}`);
  },

  renameFile(oldKey: string, newKey: string): Promise<{ moved: boolean; old_key: string; new_key: string }> {
    return apiFetch<{ moved: boolean; old_key: string; new_key: string }>("/api/gallery/files/rename", {
      method: "PATCH",
      body: JSON.stringify({ old_key: oldKey, new_key: newKey }),
    });
  },

  deleteFile(key: string): Promise<{ deleted: boolean; key: string }> {
    return apiFetch<{ deleted: boolean; key: string }>(`/api/gallery/files?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
  },

  /** Called after a successful PUT upload to persist the item in MongoDB. */
  registerItem(key: string, title = "", subtitle = ""): Promise<{ id: string; key: string; url: string; category: string; title: string; subtitle: string; uploaded_at: string }> {
    return apiFetch("/api/gallery/items/register", {
      method: "POST",
      body: JSON.stringify({ key, title, subtitle }),
    });
  },
};

// ── Users (admin-only) ──────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string; // admin | teacher | finance
  is_active: boolean;
}

export const usersApi = {
  list(signal?: AbortSignal): Promise<AppUser[]> {
    return apiFetch<AppUser[]>("/api/auth/users", { signal });
  },
  create(body: { email: string; name: string; role: string; password: string }): Promise<AppUser> {
    return apiFetch<AppUser>("/api/auth/users", { method: "POST", body: JSON.stringify(body) });
  },
  invite(body: { email: string; name: string; role: string }): Promise<AppUser> {
    return apiFetch<AppUser>("/api/auth/invite", { method: "POST", body: JSON.stringify(body) });
  },
  update(id: string, body: Partial<{ name: string; role: string; password: string; is_active: boolean }>): Promise<AppUser> {
    return apiFetch<AppUser>(`/api/auth/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
  },
  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/auth/users/${id}`, { method: "DELETE" });
  },
};

// ── Settings ──────────────────────────────────────────────────────────────────

export interface SchoolSettings {
  school_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  school_type: string;
  motto: string;
}

export interface AcademicSettings {
  academic_year: string;
  current_term: string;
  term_start_date: string;
  term_end_date: string;
  next_session_start: string;
}

export interface RolePerms {
  [key: string]: boolean;
}

export interface RoleEntry {
  role: string;
  color: string;
  perms: RolePerms;
}

export interface RolesPayload {
  roles: RoleEntry[];
}

export const settingsApi = {
  getSchool(signal?: AbortSignal): Promise<SchoolSettings> {
    return apiFetch<SchoolSettings>("/api/settings/school", { signal });
  },
  updateSchool(body: SchoolSettings): Promise<SchoolSettings> {
    return apiFetch<SchoolSettings>("/api/settings/school", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  getAcademic(signal?: AbortSignal): Promise<AcademicSettings> {
    return apiFetch<AcademicSettings>("/api/settings/academic", { signal });
  },
  updateAcademic(body: AcademicSettings): Promise<AcademicSettings> {
    return apiFetch<AcademicSettings>("/api/settings/academic", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  getRoles(signal?: AbortSignal): Promise<RolesPayload> {
    return apiFetch<RolesPayload>("/api/settings/roles", { signal });
  },
  updateRoles(body: RolesPayload): Promise<RolesPayload> {
    return apiFetch<RolesPayload>("/api/settings/roles", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};

// ── SMS Fee Management ────────────────────────────────────────────────────────

export interface SmsAdmissionFeeRow {
  student_id: string;
  name: string;
  roll_no: string;
  class_name: string;
  section: string;
  total: number;
  paid: number;
  status: string;
  last_payment_date: string | null;
  last_payment_method: string | null;
  receipt_no: string | null;
}

export interface SmsTuitionPayment {
  amount: number;
  method: string;
  date: string;
}

export interface SmsTuitionRow {
  student_id: string;
  name: string;
  roll_no: string;
  class_name: string;
  section: string;
  monthly_amount: number;
  payments: Record<string, SmsTuitionPayment>;
}

export interface SmsItemFeeRow {
  student_id: string;
  name: string;
  roll_no: string;
  class_name: string;
  section: string;
  type: string;
  description: string;
  total: number;
  paid: number;
  status: string;
  last_payment_date: string | null;
  last_payment_method: string | null;
  receipt_no: string | null;
}

export interface SmsBreakdown {
  collected: number;
  target: number;
}

export interface SmsFeeDashboard {
  total_collected: number;
  admission_collected: number;
  tuition_collected: number;
  items_collected: number;
  overdue_count: number;
  session: string;
  month_keys: string[];
  month_labels: string[];
  monthly_chart: Array<{ month: string; collected: number; expected: number }>;
  breakdown_admission: SmsBreakdown;
  breakdown_tuition: SmsBreakdown;
  breakdown_books: SmsBreakdown;
  breakdown_uniforms: SmsBreakdown;
}

export interface SmsFeeRecordRequest {
  student_id: string;
  fee_type: "Admission" | "Registration" | "Annual" | "Monthly Tuition" | "Books" | "Uniform" | "Transport";
  month_key?: string;
  amount: number;
  method: "UPI" | "NEFT" | "Cash" | "Cheque";
  date: string;
}

export interface ClassFeeStructure {
  class_name: string;
  admission_fee: number;
  registration_fee: number;
  annual_fee: number;
  tuition_fee: number;
  transport_fee: number;
  uniform_fee: number;
}

export const smsFeesApi = {
  summary(signal?: AbortSignal): Promise<SmsFeeDashboard> {
    return apiFetch<SmsFeeDashboard>("/api/fees/sms/summary", { signal });
  },
  admission(params?: { class_name?: string; search?: string }, signal?: AbortSignal): Promise<SmsAdmissionFeeRow[]> {
    const q = new URLSearchParams();
    if (params?.class_name) q.set("class_name", params.class_name);
    if (params?.search)     q.set("search",     params.search);
    const qs = q.toString();
    return apiFetch<SmsAdmissionFeeRow[]>(`/api/fees/sms/admission${qs ? `?${qs}` : ""}`, { signal });
  },
  tuition(params?: { class_name?: string; search?: string }, signal?: AbortSignal): Promise<SmsTuitionRow[]> {
    const q = new URLSearchParams();
    if (params?.class_name) q.set("class_name", params.class_name);
    if (params?.search)     q.set("search",     params.search);
    const qs = q.toString();
    return apiFetch<SmsTuitionRow[]>(`/api/fees/sms/tuition${qs ? `?${qs}` : ""}`, { signal });
  },
  items(type: "Books" | "Uniform", params?: { class_name?: string; search?: string }, signal?: AbortSignal): Promise<SmsItemFeeRow[]> {
    const q = new URLSearchParams({ type });
    if (params?.class_name) q.set("class_name", params.class_name);
    if (params?.search)     q.set("search",     params.search);
    return apiFetch<SmsItemFeeRow[]>(`/api/fees/sms/items?${q.toString()}`, { signal });
  },
  record(body: SmsFeeRecordRequest): Promise<{ receipt_no: string; message: string }> {
    return apiFetch("/api/fees/sms/record", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  getStructures(signal?: AbortSignal): Promise<ClassFeeStructure[]> {
    return apiFetch<ClassFeeStructure[]>("/api/fees/sms/structure", { signal });
  },
  upsertStructure(className: string, body: Omit<ClassFeeStructure, "class_name">): Promise<ClassFeeStructure> {
    return apiFetch<ClassFeeStructure>(`/api/fees/sms/structure/${encodeURIComponent(className)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};

