export type Role = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'DOCTOR_ASSISTANT';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type VisitStatus = 'WAITING' | 'CONSULTED' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';

export type PaymentStatus = 'PAID' | 'PARTIALLY_PAID';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: Role;
  isActive: boolean;
  doctorId?: string | null;
  doctorProfile?: Doctor | null;
}

export interface Doctor {
  id: string;
  userId: string;
  specialization?: string;
  defaultConsultationFee: number | string;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    username?: string;
  };
}

export interface Patient {
  id: string;
  patientNumber: string;
  fullName: string;
  age: number;
  gender: Gender;
  mobileNumber: string;
  dateOfBirth?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    visits: number;
  };
  visits?: PatientVisit[];
}

export interface PatientVisit {
  id: string;
  visitNumber: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Doctor;
  queueNumber: number;
  visitDate: string;
  status: VisitStatus;
  registeredById: string;
  registeredBy?: { id: string; name: string };
  consultedById?: string | null;
  consultedBy?: { id: string; name: string } | null;
  consultedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  consultation?: Consultation | null;
  payments?: Payment[];
  totalFee?: number;
  totalPaid?: number;
  balance?: number;
  consultationFee?: number | string;
  finalFee?: number | string;
  isPaid?: boolean;
  paidAmount?: number | string;
}

export interface Consultation {
  id: string;
  visitId: string;
  doctorId: string;
  assistantId?: string | null;
  assistant?: { id: string; name: string } | null;
  consultationFee: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  visitId: string;
  consultationId: string;
  amountReceived: number | string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string | null;
  collectedById: string;
  collectedBy?: { id: string; name: string };
  collectedAt: string;
}

