import {
  AuditLog,
  Appointment,
  Patient,
  QueueTicket,
  SMSLog,
  TestOrder,
  TestResult,
  TestType,
  User,
  UserRole,
} from '../types/database';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_ORDERS,
  INITIAL_PATIENTS,
  INITIAL_SMS_LOGS,
  INITIAL_TICKETS,
  INITIAL_USERS,
  PATIENT_HISTORY,
  TEST_TYPES,
} from '../data/mockData';
import { soundService } from './audio';

const STORAGE_KEY_STATE = 'medilab_state_v4_clean';

export interface AppState {
  users: User[];
  currentUser: User;
  patients: Patient[];
  currentPatientId: string;
  testTypes: TestType[];
  orders: TestOrder[];
  tickets: QueueTicket[];
  appointments: Appointment[];
  smsLogs: SMSLog[];
  auditLogs: AuditLog[];
  language: 'ar' | 'en';
  activeTab: 'patient' | 'lab_tech' | 'doctor' | 'queue_display' | 'verification' | 'audit_sms';
  selectedOrderForReport: string | null;
  selectedOrderForVerification: string | null;
  notificationBanner: { message: string; type: 'info' | 'success' | 'alert' } | null;
}

class StoreService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AppState {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_STATE);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            notificationBanner: null,
          };
        }
      } catch (err) {
        console.error('Failed to load local state:', err);
      }
    }

    return {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0],
      patients: INITIAL_PATIENTS,
      currentPatientId: INITIAL_PATIENTS[0]?.id || '',
      testTypes: TEST_TYPES,
      orders: INITIAL_ORDERS,
      tickets: INITIAL_TICKETS,
      appointments: [],
      smsLogs: INITIAL_SMS_LOGS,
      auditLogs: INITIAL_AUDIT_LOGS,
      language: 'ar',
      activeTab: 'patient',
      selectedOrderForReport: null,
      selectedOrderForVerification: null,
      notificationBanner: null,
    };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Storage quota exceeded or error', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): AppState {
    return this.state;
  }

  // --- UI State Setters ---
  public setLanguage(lang: 'ar' | 'en') {
    this.state.language = lang;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
    this.persist();
  }

  public setActiveTab(tab: AppState['activeTab']) {
    this.state.activeTab = tab;
    this.persist();
  }

  public setCurrentUser(user: User) {
    this.state.currentUser = user;
    this.persist();
  }

  public setCurrentPatientId(id: string) {
    this.state.currentPatientId = id;
    this.persist();
  }

  public setSelectedOrderForReport(orderId: string | null) {
    this.state.selectedOrderForReport = orderId;
    this.persist();
  }

  public setSelectedOrderForVerification(orderId: string | null) {
    this.state.selectedOrderForVerification = orderId;
    this.persist();
  }

  public showNotification(message: string, type: 'info' | 'success' | 'alert' = 'info') {
    this.state.notificationBanner = { message, type };
    this.notify();
    setTimeout(() => {
      if (this.state.notificationBanner?.message === message) {
        this.state.notificationBanner = null;
        this.notify();
      }
    }, 4500);
  }

  // --- Add Patient Dynamically ---
  public addPatient(p: {
    fullName: string;
    nationalId: string;
    phone: string;
    gender: 'male' | 'female';
    bloodType: Patient['bloodType'];
  }): Patient {
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      fileNumber: `MED-${10000 + this.state.patients.length + 1}`,
      fullName: p.fullName.trim() || 'مريض جديد',
      nationalId: p.nationalId.trim() || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      phone: p.phone.trim() || '+966500000000',
      birthDate: '1995-01-01',
      gender: p.gender,
      bloodType: p.bloodType,
      chronicConditions: [],
    };
    this.state.patients = [newPat, ...this.state.patients];
    this.state.currentPatientId = newPat.id;
    this.logAudit('PATIENT_REGISTERED', `تسجيل ملف مريض جديد: ${newPat.fullName} (${newPat.fileNumber})`, newPat.id);
    this.showNotification(`تم تسجيل ملف المريض ${newPat.fullName} بنجاح!`, 'success');
    this.persist();
    return newPat;
  }

  // --- Audit Trail Logging ---
  public logAudit(action: string, details: string, targetId?: string) {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      userRole: this.state.currentUser.role,
      action,
      details,
      targetId,
      ipAddress: '192.168.1.104',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
  }

  // --- SMS Logging Simulation ---
  public sendSMS(
    patientId: string,
    phone: string,
    messageText: string,
    type: SMSLog['type'],
    verificationPin?: string,
    directReportUrl?: string
  ) {
    const patient = this.state.patients.find((p) => p.id === patientId);
    const newSms: SMSLog = {
      id: `sms-${Date.now()}`,
      patientId,
      patientName: patient ? patient.fullName : 'مريض مسجل',
      phone,
      messageText,
      type,
      status: 'delivered',
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      verificationPin,
      directReportUrl,
    };
    this.state.smsLogs = [newSms, ...this.state.smsLogs];
    this.showNotification(`📲 تم إرسال رسالة SMS إلى ${phone}: "${messageText.substring(0, 45)}..."`, 'info');
  }

  // --- Turnaround & Workload Calculation ---
  public calculateEstimatedMinutes(testTypeId: string): number {
    const test = this.state.testTypes.find((t) => t.id === testTypeId);
    const baseMinutes = test ? test.turnaroundMinutes : 40;
    const activeLabOrders = this.state.orders.filter(
      (o) => o.status === 'sample_collected' || o.status === 'processing'
    ).length;
    const workloadMultiplier = 1 + activeLabOrders * 0.08;
    return Math.round(baseMinutes * workloadMultiplier);
  }

  // --- Automated Reference Range Flagging ---
  public evaluateFlag(
    val: number,
    minNormal: number,
    maxNormal: number,
    criticalLow?: number,
    criticalHigh?: number
  ): 'normal' | 'low' | 'high' | 'critical' {
    if (criticalLow !== undefined && val <= criticalLow) return 'critical';
    if (criticalHigh !== undefined && val >= criticalHigh) return 'critical';
    if (val < minNormal) return 'low';
    if (val > maxNormal) return 'high';
    return 'normal';
  }

  // --- Delta Check Finder ---
  public findDeltaCheck(
    patientId: string,
    parameterCode: string,
    currentValue: number,
    deltaTolerancePercent: number
  ): { previousValue?: number; previousDate?: string; deltaChangePercent?: number; deltaFlag: boolean } {
    const patientHist = PATIENT_HISTORY[patientId] || [];
    const matchingHist = patientHist
      .filter((h) => h.parameterCode === parameterCode)
      .sort((a, b) => b.date.localeCompare(a.date));

    let prevVal: number | undefined;
    let prevDate: string | undefined;

    if (matchingHist.length > 0) {
      prevVal = matchingHist[0].value;
      prevDate = matchingHist[0].date;
    } else {
      const pastOrders = this.state.orders
        .filter((o) => o.patientId === patientId && o.status === 'approved')
        .sort((a, b) => (b.approvedAt || '').localeCompare(a.approvedAt || ''));

      for (const order of pastOrders) {
        const res = order.results.find((r) => r.parameterCode === parameterCode);
        if (res) {
          prevVal = res.measuredValue;
          prevDate = order.approvedAt?.substring(0, 10);
          break;
        }
      }
    }

    if (prevVal === undefined || prevVal === 0) {
      return { deltaFlag: false };
    }

    const changePercent = Number((((currentValue - prevVal) / prevVal) * 100).toFixed(1));
    const exceedsTolerance = Math.abs(changePercent) >= deltaTolerancePercent;

    return {
      previousValue: prevVal,
      previousDate: prevDate,
      deltaChangePercent: changePercent,
      deltaFlag: exceedsTolerance,
    };
  }

  // --- Register New Sample & Issue Queue Ticket ---
  public registerNewSample(
    patientId: string,
    testTypeId: string,
    priority: TestOrder['priority'] = 'routine',
    counterRoom: string = 'غرفة سحب العينات 1'
  ): { order: TestOrder; ticket: QueueTicket } {
    const patient = this.state.patients.find((p) => p.id === patientId) || this.state.patients[0];
    const testType = this.state.testTypes.find((t) => t.id === testTypeId) || this.state.testTypes[0];

    const seq = 8940 + this.state.orders.length + 1;
    const orderNumber = `ORD-2026-${seq}`;
    const barcode = `LAB-${seq}-${testType.code}`;
    const ticketSeq = 100 + this.state.tickets.length + 1;
    const ticketNumber = `A-${ticketSeq}`;

    const estMinutes = this.calculateEstimatedMinutes(testType.id);
    const now = new Date();
    const estReady = new Date(now.getTime() + estMinutes * 60000);

    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const estReadyStr = estReady.toISOString().replace('T', ' ').substring(0, 19);

    const newTicket: QueueTicket = {
      id: `t-${Date.now()}`,
      ticketNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      serviceType: `سحب عينات ${testType.nameAr}`,
      counterRoom,
      status: 'waiting',
      issuedAt: nowStr,
      estimatedWaitMinutes: Math.max(5, this.state.tickets.filter((t) => t.status === 'waiting').length * 4),
      branch: 'الفرع الرئيسي',
    };

    const newOrder: TestOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      barcode,
      patientId: patient.id,
      patient,
      testTypeId: testType.id,
      testType,
      status: 'sample_collected',
      priority,
      sampleCollectedAt: nowStr,
      estimatedReadyAt: estReadyStr,
      ticketNumber,
      counterRoom,
      results: [],
    };

    this.state.orders = [newOrder, ...this.state.orders];
    this.state.tickets = [...this.state.tickets, newTicket];

    this.logAudit(
      'SAMPLE_REGISTERED',
      `تسجيل طلب فحص جديد ${orderNumber} وتوليد الباركود ${barcode} وتذكرة الطابور ${ticketNumber} للمريض ${patient.fullName}`,
      newOrder.id
    );

    const pin = patient.nationalId.slice(-4);
    this.sendSMS(
      patient.id,
      patient.phone,
      `مختبرات MediLab: تم استلام عيناتكم بنجاح! رقم التذكرة: ${ticketNumber}. الوقت المتوقع: ${estMinutes} دقيقة. تتبع دورك حياً: https://medilab.sa/track/${orderNumber}`,
      'sample_collected',
      pin,
      `https://medilab.sa/track/${orderNumber}`
    );

    this.persist();
    return { order: newOrder, ticket: newTicket };
  }

  // --- Save / Update Results by Lab Tech ---
  public saveTestResults(
    orderId: string,
    resultsInput: { parameterId: string; measuredValue: number; techNotes?: string }[],
    overallComments?: string,
    customTechName?: string
  ) {
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = this.state.orders[orderIndex];
    const testType = order.testType;

    const evaluatedResults: TestResult[] = resultsInput.map((input) => {
      const param = testType.parameters.find((p) => p.id === input.parameterId)!;
      const flag = this.evaluateFlag(
        input.measuredValue,
        param.minNormal,
        param.maxNormal,
        param.criticalLow,
        param.criticalHigh
      );

      const delta = this.findDeltaCheck(
        order.patientId,
        param.code,
        input.measuredValue,
        param.deltaTolerancePercent
      );

      return {
        id: `res-${order.id}-${param.id}`,
        orderId: order.id,
        parameterId: param.id,
        parameterCode: param.code,
        parameterNameAr: param.nameAr,
        parameterNameEn: param.nameEn,
        unit: param.unit,
        measuredValue: input.measuredValue,
        minNormal: param.minNormal,
        maxNormal: param.maxNormal,
        criticalLow: param.criticalLow,
        criticalHigh: param.criticalHigh,
        flag,
        isAbnormal: flag !== 'normal',
        techNotes: input.techNotes,
        measuredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        previousValue: delta.previousValue,
        previousDate: delta.previousDate,
        deltaChangePercent: delta.deltaChangePercent,
        deltaFlag: delta.deltaFlag,
      };
    });

    const hasDeltaWarning = evaluatedResults.some((r) => r.deltaFlag);
    const hasCritical = evaluatedResults.some((r) => r.flag === 'critical');

    order.results = evaluatedResults;
    order.labTechId = this.state.currentUser.id;
    order.labTechName = customTechName || 'فني المختبر';
    order.status = 'pending_approval';
    if (overallComments) {
      order.overallComments = overallComments;
    }

    this.logAudit(
      'RESULTS_ENTERED',
      `تم إدخال وتدقيق قياسات الفحص للطلب ${order.orderNumber} ونقل الحالة إلى (بانتظار اعتماد الطبيب). ${
        hasDeltaWarning ? '⚠️ تم رصد تنبيه دلتا تشيك.' : ''
      } ${hasCritical ? '🚨 توجد قيم حرجة.' : ''}`,
      order.id
    );

    this.showNotification(
      `تم حفظ النتائج للطلب ${order.orderNumber} بنجاح وتحويله إلى الطبيب للاعتماد.`,
      'success'
    );

    this.persist();
  }

  // --- Doctor Delta Check and Approval ---
  public async approveAndSignOrder(
    orderId: string,
    doctorComments?: string,
    customDoctorName?: string
  ) {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const rawData = `${order.orderNumber}-${order.patient.nationalId}-${Date.now()}-${order.results.map((r) => `${r.parameterCode}:${r.measuredValue}`).join(';')}`;
    let hash = '';
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(rawData);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } else {
        hash = 'e7b93c8a9f24301d087b33a75e219fb56b823e5904d9e037b5212c41938fe8b1';
      }
    } catch {
      hash = 'e7b93c8a9f24301d087b33a75e219fb56b823e5904d9e037b5212c41938fe8b1';
    }

    const docName = customDoctorName?.trim() || 'الطبيب الاستشاري المعالج';
    order.status = 'approved';
    order.doctorId = this.state.currentUser.id;
    order.doctorName = docName;
    order.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    order.cryptographicHash = hash;
    if (doctorComments) {
      order.overallComments = doctorComments;
    }

    const matchingTicket = this.state.tickets.find((t) => t.ticketNumber === order.ticketNumber);
    if (matchingTicket) {
      matchingTicket.status = 'completed';
    }

    this.logAudit(
      'REPORT_APPROVED',
      `تم اعتماد وتوقيع التقرير الطبي ${order.orderNumber} رقمياً بواسطة ${docName} وتوليد بصمة التجزئة SHA-256 (${hash.substring(0, 12)}...)`,
      order.id
    );

    const pin = order.patient.nationalId.slice(-4);
    this.sendSMS(
      order.patient.id,
      order.patient.phone,
      `مختبرات MediLab: يسعدنا إبلاغك بأن تقرير فحصك (${order.testType.nameAr}) معتمد ومتاح الآن! كلمة المرور: آخر 4 أرقام من هويتك (${pin}). الرابط المباشر: https://medilab.sa/report/${order.orderNumber}`,
      'results_ready',
      pin,
      `https://medilab.sa/report/${order.orderNumber}`
    );

    this.showNotification(`تم اعتماد التقرير الطبي رقم ${order.orderNumber} رسمياً وتوليد الختم الرقمي!`, 'success');
    this.persist();
  }

  // --- Queue Ticket Calling (with Sound Chime) ---
  public callTicket(ticketId: string, counterRoom?: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    if (counterRoom) {
      ticket.counterRoom = counterRoom;
    }
    ticket.status = 'called';
    ticket.calledAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    soundService.announceTicket(ticket.ticketNumber, ticket.counterRoom, this.state.language);

    this.logAudit(
      'QUEUE_TICKET_CALLED',
      `استدعاء التذكرة ${ticket.ticketNumber} إلى ${ticket.counterRoom}`,
      ticket.id
    );

    this.showNotification(`🔔 تم استدعاء التذكرة ${ticket.ticketNumber} إلى ${ticket.counterRoom}`, 'info');
    this.persist();
  }

  public advanceTicketStatus(ticketId: string, newStatus: QueueTicket['status']) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    ticket.status = newStatus;
    this.persist();
  }

  // --- Appointment Booking ---
  public bookAppointment(
    patientId: string,
    testTypeIds: string[],
    branch: string,
    date: string,
    timeSlot: string,
    notes?: string
  ): Appointment {
    const patient = this.state.patients.find((p) => p.id === patientId) || this.state.patients[0];
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      testTypeIds,
      branch,
      date,
      timeSlot,
      status: 'confirmed',
      notes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.state.appointments = [newApt, ...this.state.appointments];

    this.logAudit(
      'APPOINTMENT_BOOKED',
      `حجز موعد سحب عينات للمريض ${patient.fullName} بتاريخ ${date} الساعة ${timeSlot} بفرع ${branch}`,
      newApt.id
    );

    this.sendSMS(
      patient.id,
      patient.phone,
      `مختبرات MediLab: تم تأكيد حجز موعد سحب العينات بتاريخ ${date} الساعة ${timeSlot} بفرع ${branch}. نرجو الحضور قبل الموعد بـ 10 دقائق.`,
      'appointment_reminder'
    );

    this.showNotification('تم تأكيد حجز الموعد بنجاح وإرسال رسالة التأكيد للمريض!', 'success');
    this.persist();
    return newApt;
  }

  // --- Reset to Initial Clean State ---
  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_STATE);
    }
    this.state = this.loadInitialState();
    this.showNotification('تمت إعادة ضبط النظام إلى حالة جديدة نظيفة وجاهزة لاختبارك.', 'info');
    this.persist();
  }
}

export const store = new StoreService();
