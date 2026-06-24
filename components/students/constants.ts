import type { Guardian, Guardian2, FeeInfo } from "@/lib/api";

export const feeVariant: Record<string, string> = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unpaid:  "bg-red-50 text-red-700 border-red-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
};

export const BLANK_GUARDIAN: Guardian = {
  name: "", relation: "", phone: "", email: "", address: "", id_type: "", id_number: "", occupation: "",
};

export const BLANK_GUARDIAN2: Guardian2 = {
  name: "", relation: "", phone: "", email: "", id_type: "", id_number: "",
};

export const BLANK_FEES: FeeInfo = {
  tuition_fee: 0, concession_amount: 0, concession_reason: "",
  transport_fee: 0, other_monthly_fee: 0,
  admission_fee: 0, admission_fee_paid: 0,
  book_fee: 0, book_fee_paid: 0,
  uniform_fee: 0, uniform_fee_paid: 0,
  fee_status: "Paid",
};

export const BLANK_WIZARD = {
  name: "", dob: "", gender: "", blood_group: "", class_name: "", section: "", roll_no: "",
  admission_date: "", phone: "", email: "", address: "",
  previous_school: "", tc_number: "", cc_number: "", student_id_type: "", student_id_number: "",
  fees: { ...BLANK_FEES }, attendance: 100, is_active: true,
  guardian: { ...BLANK_GUARDIAN },
  guardian2: { ...BLANK_GUARDIAN2 },
};
