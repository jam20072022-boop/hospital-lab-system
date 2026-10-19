/**
 * MediLab Pro - Database Models & Type Definitions
 * Designed according to Laboratory Information Systems (LIS) & HIPAA Standards
 */

export type UserRole = 'admin' | 'doctor' | 'lab_tech' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  digitalSignature?: string;
  licenseNumber: string;
  avatarUrl?: string;
}

export interface Patient {
  id: string;
  nationalId: string; // National ID or Iqama
  fullName: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  chronicConditions?: string[];
  email?: string;
  fileNumber: string;
}

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  testTypeIds: string[];
  branch: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface TestParameter {
  id: string;
  testTypeId: string;
  code: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  criticalLow?: number;
  criticalHigh?: number;
  deltaTolerancePercent: number; // e.g. 20% shift triggers Delta Check flag
}

export interface TestType {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: string;
  sampleType: string;
  turnaroundMinutes: number;
  price: number;
  parameters: TestParameter[];
}

export type OrderStatus =
  | 'sample_collected'
  | 'processing'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

export type OrderPriority = 'routine' | 'urgent' | 'stat';

export interface TestResult {
  id: string;
  orderId: string;
  parameterId: string;
  parameterCode: string;
  parameterNameAr: string;
  parameterNameEn: string;
  unit: string;
  measuredValue: number;
  minNormal: number;
  maxNormal: number;
  criticalLow?: number;
  criticalHigh?: number;
  flag: 'normal' | 'low' | 'high' | 'critical';
  isAbnormal: boolean;
  techNotes?: string;
  measuredAt: string;
  previousValue?: number;
  previousDate?: string;
  deltaChangePercent?: number;
  deltaFlag?: boolean;
}

export interface TestOrder {
  id: string;
  orderNumber: string; // e.g. ORD-2026-8941
  barcode: string;
  patientId: string;
  patient: Patient;
  doctorId?: string;
  doctorName?: string;
  labTechId?: string;
  labTechName?: string;
  testTypeId: string;
  testType: TestType;
  status: OrderStatus;
  priority: OrderPriority;
  sampleCollectedAt: string;
  estimatedReadyAt: string;
  approvedAt?: string;
  cryptographicHash?: string;
  results: TestResult[];
  overallComments?: string;
  counterRoom?: string;
  ticketNumber?: string;
}

export type QueueTicketStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'no_show';

export interface QueueTicket {
  id: string;
  ticketNumber: string; // e.g. A-104
  orderId?: string;
  patientId: string;
  patientName: string;
  serviceType: string;
  counterRoom: string;
  status: QueueTicketStatus;
  issuedAt: string;
  calledAt?: string;
  estimatedWaitMinutes: number;
  branch: string;
}

export interface SMSLog {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  messageText: string;
  type: 'sample_collected' | 'results_ready' | 'appointment_reminder' | 'verification_otp';
  status: 'delivered' | 'sent' | 'failed';
  sentAt: string;
  verificationPin?: string;
  directReportUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  targetId?: string;
  ipAddress: string;
  timestamp: string;
}
