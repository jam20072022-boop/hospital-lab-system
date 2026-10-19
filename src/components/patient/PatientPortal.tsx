import React, { useState, useEffect } from 'react';
import { AppState, store } from '../../services/store';
import { TrendChart } from './TrendChart';
import { BookAppointmentModal } from './BookAppointmentModal';
import { Patient } from '../../types/database';
import {
  Clock,
  Users,
  CheckCircle2,
  FileText,
  Calendar,
  Share2,
  Download,
  AlertCircle,
  ShieldCheck,
  Activity,
  QrCode,
  UserPlus,
  FlaskConical,
  X,
  Plus,
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const PatientPortal: React.FC<Props> = ({ state }) => {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  // New Patient Form state
  const [newFullName, setNewFullName] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newPhone, setNewPhone] = useState('+9665');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newBloodType, setNewBloodType] = useState<Patient['bloodType']>('O+');

  const patient = state.patients.find((p) => p.id === state.currentPatientId) || state.patients[0];

  // Active orders for this patient
  const patientOrders = patient ? state.orders.filter((o) => o.patientId === patient.id) : [];
  const activeOrder = patientOrders.find(
    (o) => o.status !== 'approved' && o.status !== 'rejected'
  ) || patientOrders[0];

  // Matching queue ticket for active order or patient
  const activeTicket = patient
    ? state.tickets
        .slice()
        .reverse()
        .find((t) => t.patientId === patient.id && t.status !== 'completed' && t.status !== 'no_show')
    : undefined;

  // Completed approved reports
  const approvedOrders = patientOrders.filter((o) => o.status === 'approved');

  // Appointments for this patient
  const patientAppointments = patient
    ? state.appointments.filter((a) => a.patientId === patient.id)
    : [];

  // People ahead in queue
  const waitingTickets = state.tickets.filter((t) => t.status === 'waiting');
  const myQueueIndex = activeTicket
    ? waitingTickets.findIndex((t) => t.ticketNumber === activeTicket.ticketNumber)
    : -1;
  const peopleAhead = myQueueIndex >= 0 ? myQueueIndex : 0;

  // Countdown timer simulation to estimated ready time
  const [minutesLeft, setMinutesLeft] = useState<number>(35);

  useEffect(() => {
    if (activeOrder && activeOrder.estimatedReadyAt) {
      const readyTime = new Date(activeOrder.estimatedReadyAt.replace(' ', 'T')).getTime();
      const diff = Math.max(0, Math.round((readyTime - Date.now()) / 60000));
      setMinutesLeft(diff > 0 ? diff : 8);
    }
  }, [activeOrder]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;
    store.addPatient({
      fullName: newFullName,
      nationalId: newNationalId || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      phone: newPhone,
      gender: newGender,
      bloodType: newBloodType,
    });
    setShowAddPatientModal(false);
    setNewFullName('');
    setNewNationalId('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Patient Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-teal-950/20 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border-8 border-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border-8 border-teal-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xl shadow-inner">
              {patient ? patient.fullName.charAt(0) : 'م'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black">
                  {patient ? patient.fullName : 'سجل مريض جديد'}
                </h1>
                {patient && (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30 font-mono-numbers">
                      {patient.fileNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 font-mono-numbers">
                      {patient.bloodType}
                    </span>
                  </>
                )}
              </div>
              {patient && (
                <p className="text-xs text-teal-200/80 mt-1 flex items-center gap-2">
                  <span>
                    {state.language === 'ar' ? 'الهوية:' : 'ID:'} ••••••{patient.nationalId.slice(-4)}
                  </span>
                  <span>•</span>
                  <span>{patient.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
            {/* Add New Patient Button */}
            <button
              onClick={() => setShowAddPatientModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition"
            >
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span>{state.language === 'ar' ? 'إضافة مريض جديد' : 'New Patient'}</span>
            </button>

            {/* Patient Switcher if multiple patients exist */}
            {state.patients.length > 1 && (
              <select
                value={patient?.id}
                onChange={(e) => store.setCurrentPatientId(e.target.value)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                {state.patients.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900">
                    {p.fullName} ({p.fileNumber})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowAppointmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'حجز موعد' : 'Book Appointment'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE QUEUE TICKET & REALTIME STATUS CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'بطاقة التتبع الحي لدور المريض وفحص العينة' : 'Live Queue & Sample Tracker'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeOrder
                ? `${state.language === 'ar' ? 'طلب رقم' : 'Order ID'}: ${activeOrder.orderNumber} • ${activeOrder.testType.nameAr}`
                : state.language === 'ar'
                ? 'جاهز للاختبار. يمكنك تسجيل عينة جديدة الآن.'
                : 'Ready for testing.'}
            </p>
          </div>

          {activeTicket && (
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block">
                  {state.language === 'ar' ? 'رقم التذكرة' : 'Ticket Number'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 font-mono-numbers">
                  {activeTicket.ticketNumber}
                </span>
              </div>
            </div>
          )}
        </div>

        {activeOrder ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    {state.language === 'ar' ? 'أشخاص في الانتظار قبلك' : 'People Ahead'}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono-numbers">
                    {peopleAhead > 0 ? `${peopleAhead} ${state.language === 'ar' ? 'مريض' : 'patients'}` : state.language === 'ar' ? 'دورك الآن في المحطة' : 'Your turn now'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    {state.language === 'ar' ? 'الوقت التقديري لصدور النتيجة' : 'Est. Ready Time'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono-numbers">
                      {activeOrder.status === 'approved' ? (state.language === 'ar' ? 'متاحة الآن' : 'Ready Now') : `~ ${minutesLeft} دقيقة`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    {state.language === 'ar' ? 'محطة الخدمة المسندة' : 'Assigned Station'}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {activeOrder.counterRoom || 'غرفة سحب العينات 1'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Step Live Sample Progression Pipeline */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                {state.language === 'ar' ? 'مراحل تدفق ومعالجة العينة في المختبر:' : 'Sample Workflow Stages:'}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  className={`p-3.5 rounded-2xl border text-start transition ${
                    activeOrder.status === 'sample_collected' ||
                    activeOrder.status === 'processing' ||
                    activeOrder.status === 'pending_approval' ||
                    activeOrder.status === 'approved'
                      ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {state.language === 'ar' ? '1. سحب العينة' : '1. Sample Drawn'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {state.language === 'ar' ? 'تم استلام الأنبوب وتوليد الباركود' : 'Tube barcoded & logged'}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-start transition ${
                    activeOrder.status === 'processing'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : activeOrder.status === 'pending_approval' || activeOrder.status === 'approved'
                      ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {activeOrder.status === 'processing' ? (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold animate-spin">
                        ⟳
                      </span>
                    ) : activeOrder.status === 'pending_approval' || activeOrder.status === 'approved' ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        2
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {state.language === 'ar' ? '2. التحليل الآلي' : '2. In Lab Testing'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {state.language === 'ar' ? 'قيد القياس بأجهزة التحليل الآلية' : 'Running on analyzers'}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-start transition ${
                    activeOrder.status === 'pending_approval'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : activeOrder.status === 'approved'
                      ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {activeOrder.status === 'pending_approval' ? (
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                        !
                      </span>
                    ) : activeOrder.status === 'approved' ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        3
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {state.language === 'ar' ? '3. التدقيق الطبي' : '3. Doctor Review'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {state.language === 'ar' ? 'مراجعة الطبيب وتطبيق Delta Check' : 'Medical verification'}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-start transition ${
                    activeOrder.status === 'approved'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {activeOrder.status === 'approved' ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        4
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {state.language === 'ar' ? '4. التقرير جاهز' : '4. Report Ready'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {state.language === 'ar' ? 'معتمد وموقع مع رمز QR المشفر' : 'Signed PDF generated'}
                  </p>
                </div>
              </div>
            </div>

            {activeOrder.status === 'approved' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                      {state.language === 'ar'
                        ? 'تقرير الفحص الطبي معتمد وجاهز للتحميل والطباعة!'
                        : 'Official Medical Report is Ready!'}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {state.language === 'ar'
                        ? `المعتمد: ${activeOrder.doctorName || 'الطبيب الاستشاري'} • مزود برمز QR للتحقق الرسمي`
                        : 'Signed with cryptographic tamper-proof validation'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => store.setSelectedOrderForReport(activeOrder.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>{state.language === 'ar' ? 'عرض التقرير الرسمي (PDF)' : 'View Official PDF'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
              <FlaskConical className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {state.language === 'ar'
                ? 'لا توجد فحوصات معلقة حالياً. ابدأ الاختبار بنفسك عبر تسجيل عينة جديدة!'
                : 'No active tests right now. Start testing by registering a sample!'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => store.setActiveTab('lab_tech')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{state.language === 'ar' ? 'تسجيل عينة فحص جديدة' : 'Register New Sample'}</span>
              </button>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
              >
                <Calendar className="w-4 h-4" />
                <span>{state.language === 'ar' ? 'حجز موعد لسحب العينات' : 'Book Appointment'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TREND CHART: LONGITUDINAL MEDICAL HISTORY */}
      {patient && <TrendChart patientId={patient.id} lang={state.language} />}

      {/* OFFICIAL MEDICAL REPORTS ARCHIVE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>{state.language === 'ar' ? 'سجل التقارير الطبية المعتمدة' : 'Approved Medical Reports Archive'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {state.language === 'ar'
                ? 'تقارير رسمية صادرة برقم ترخيص ومختومة إلكترونياً مع رمز QR للتحقق السريع'
                : 'Official signed reports with tamper-proof QR validation and ISO 15189 compliance'}
            </p>
          </div>
        </div>

        {approvedOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {state.language === 'ar'
              ? 'لم تصدر أي تقارير معتمدة بعد لهذا المريض.'
              : 'No approved reports found yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {approvedOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-teal-500/50 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {order.testType.nameAr}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono-numbers">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {state.language === 'ar' ? 'تاريخ الاعتماد:' : 'Approved on:'} {order.approvedAt} • {order.doctorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => store.setSelectedOrderForVerification(order.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-600" />
                    <span>{state.language === 'ar' ? 'فحص البصمة' : 'Verify'}</span>
                  </button>

                  <button
                    onClick={() => store.setSelectedOrderForReport(order.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{state.language === 'ar' ? 'تحميل / طباعة التقرير' : 'View PDF'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>{state.language === 'ar' ? 'المواعيد المسبقة لسحب العينات' : 'Phlebotomy Appointments'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {state.language === 'ar'
                ? 'حجز مسبق لتجنب الانتظار داخل صالة المختبر'
                : 'Fast-track your lab visit by pre-booking your slot'}
            </p>
          </div>

          <button
            onClick={() => setShowAppointmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{state.language === 'ar' ? '+ حجز موعد' : '+ New'}</span>
          </button>
        </div>

        {patientAppointments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {state.language === 'ar' ? 'لا توجد مواعيد مجدولة حالياً.' : 'No scheduled appointments.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>{state.language === 'ar' ? 'موعد مؤكد' : 'Confirmed'}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono-numbers">
                    {apt.date} • {apt.timeSlot}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {apt.branch}
                </div>
                {apt.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{apt.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <BookAppointmentModal state={state} onClose={() => setShowAppointmentModal(false)} />
      )}

      {/* ADD NEW PATIENT MODAL */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-fadeIn my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold text-base">
                  {state.language === 'ar' ? 'تسجيل مريض جديد' : 'Register New Patient'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {state.language === 'ar' ? 'اسم المريض بالكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="مثال: محمد بن عبد العزيز..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {state.language === 'ar' ? 'رقم الهوية / الإقامة' : 'National ID'}
                  </label>
                  <input
                    type="text"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    placeholder="10XXXXXXXX"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium font-mono-numbers focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {state.language === 'ar' ? 'رقم الجوال' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+9665..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium font-mono-numbers focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {state.language === 'ar' ? 'الجنس' : 'Gender'}
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'male' | 'female')}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="male">{state.language === 'ar' ? 'ذكر' : 'Male'}</option>
                    <option value="female">{state.language === 'ar' ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {state.language === 'ar' ? 'فصيلة الدم' : 'Blood Type'}
                  </label>
                  <select
                    value={newBloodType}
                    onChange={(e) => setNewBloodType(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  {state.language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition"
                >
                  {state.language === 'ar' ? 'حفظ وتفعيل المريض' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
