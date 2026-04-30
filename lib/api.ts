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
  name: string;
  teacher: string;
  sections: string[];
  subjects: string[];
  student_count: number;
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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
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
  list(): Promise<Class[]> {
    return apiFetch<Class[]>("/api/classes");
  },

  stats(): Promise<ClassStats> {
    return apiFetch<ClassStats>("/api/classes/stats");
  },

  create(body: Omit<Class, "id" | "student_count">): Promise<Class> {
    return apiFetch<Class>("/api/classes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<Omit<Class, "id" | "student_count">>): Promise<Class> {
    return apiFetch<Class>(`/api/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/classes/${id}`, { method: "DELETE" });
  },
};
