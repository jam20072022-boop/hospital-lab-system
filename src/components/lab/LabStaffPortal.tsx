import React, { useState } from 'react';
import { AppState, store } from '../../services/store';
import { TestOrder, TestResult, TestType, Patient } from '../../types/database';
import {
  FlaskConical,
  PlusCircle,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Volume2,
  Tv,
  Check,
  Zap,
  UserPlus,
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const LabStaffPortal: React.FC<Props> = ({ state }) => {
  const [subTab, setSubTab] = useState<'worklist' | 'new_sample'>(
    state.orders.length === 0 ? 'new_sample' : 'worklist'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    state.orders.find((o) => o.status === 'processing' || o.status === 'sample_collected')?.id ||
      state.orders[0]?.id ||
      ''
  );

  // New Sample Form State
  const [newPatientId, setNewPatientId] = useState<string>(state.patients[0]?.id || '');
  const [isCreatingNewPatientInline, setIsCreatingNewPatientInline] = useState(false);
  const [inlinePatientName, setInlinePatientName] = useState('');
  const [inlinePatientId, setInlinePatientId] = useState('');
  const [inlinePhone, setInlinePhone] = useState('+9665');

  const [newTestTypeId, setNewTestTypeId] = useState<string>(state.testTypes[0]?.id || '');
  const [newPriority, setNewPriority] = useState<TestOrder['priority']>('routine');
  const [newCounterRoom, setNewCounterRoom] = useState<string>('غرفة سحب العينات 1');

  // Result entry values buffer: parameterId -> { value, notes }
  const [entryValues, setEntryValues] = useState<Record<string, { value: string; notes: string }>>({});
  const [overallNotes, setOverallNotes] = useState<string>('');

  const currentOrder = state.orders.find((o) => o.id === selectedOrderId);

  React.useEffect(() => {
    if (currentOrder) {
      const buffer: Record<string, { value: string; notes: string }> = {};
      currentOrder.testType.parameters.forEach((param) => {
        const existingRes = currentOrder.results.find((r) => r.parameterId === param.id);
        buffer[param.id] = {
          value: existingRes ? String(existingRes.measuredValue) : '',
          notes: existingRes?.techNotes || '',
        };
      });
      setEntryValues(buffer);
      setOverallNotes(currentOrder.overallComments || '');
    }
  }, [selectedOrderId, currentOrder]);

  const handleRegisterSample = (e: React.FormEvent) => {
    e.preventDefault();
    let patId = newPatientId;

    if (isCreatingNewPatientInline) {
      if (!inlinePatientName.trim()) return;
      const created = store.addPatient({
        fullName: inlinePatientName,
        nationalId: inlinePatientId || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        phone: inlinePhone,
        gender: 'male',
        bloodType: 'O+',
      });
      patId = created.id;
    }

    const { order } = store.registerNewSample(patId, newTestTypeId, newPriority, newCounterRoom);
    setSelectedOrderId(order.id);
    setSubTab('worklist');
    setIsCreatingNewPatientInline(false);
    setInlinePatientName('');
    setInlinePatientId('');
  };

  const handleValueChange = (parameterId: string, val: string) => {
    setEntryValues((prev) => ({
      ...prev,
      [parameterId]: {
        value: val,
        notes: prev[parameterId]?.notes || '',
      },
    }));
  };

  const handleSubmitResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const payload = currentOrder.testType.parameters.map((param) => {
      const item = entryValues[param.id];
      const val = item && item.value !== '' ? parseFloat(item.value) : (param.minNormal + param.maxNormal) / 2;
      return {
        parameterId: param.id,
        measuredValue: Number(val.toFixed(2)),
        techNotes: item?.notes || '',
      };
    });

    store.saveTestResults(currentOrder.id, payload, overallNotes);
  };

  const waitingTickets = state.tickets.filter((t) => t.status === 'waiting');
  const nextTicket = waitingTickets[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'لوحة تحكم فني ومسؤول المختبر' : 'Lab Technologist Workspace'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
                LIS Engine v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {state.language === 'ar'
                ? 'إدخال قياسات الأجهزة الآلية، الفحص التلقائي للنطاقات المرجعية، وإحالة الفحوصات للاعتماد الطبي'
                : 'Automated range flagging, rapid matrix keyboard entry, and referral to Doctor'}
            </p>
          </div>
        </div>

        {/* Action Buttons & Fast Queue Calling */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {nextTicket && (
            <button
              onClick={() => store.callTicket(nextTicket.id, 'غرفة سحب العينات 1')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>
                {state.language === 'ar'
                  ? `استدعاء الدور التالي (${nextTicket.ticketNumber})`
                  : `Call Next (${nextTicket.ticketNumber})`}
              </span>
            </button>
          )}

          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSubTab('worklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subTab === 'worklist'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {state.language === 'ar' ? 'قائمة الفحوصات والقياس' : 'Worklist & Entry'}
            </button>
            <button
              onClick={() => setSubTab('new_sample')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subTab === 'new_sample'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{state.language === 'ar' ? 'تسجيل عينة جديدة' : 'New Intake'}</span>
            </button>
          </div>
        </div>
      </div>

      {subTab === 'new_sample' ? (
        /* SAMPLE REGISTRATION & BARCODE GENERATOR */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto animate-fadeIn">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'تسجيل عينة فحص جديدة وتوليد الباركود وتذكرة الطابور' : 'Register New Laboratory Sample'}
              </h2>
              <p className="text-xs text-slate-500">
                {state.language === 'ar'
                  ? 'أدخل بيانات المريض ونوع الفحص المطلوب لتوليد الباركود وإدراج التذكرة في الطابور'
                  : 'Generates barcode, ticket, calculates workload turnaround, and triggers SMS'}
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSample} className="mt-6 space-y-5">
            {/* Patient Option: Select Existing or Type New Patient */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {state.language === 'ar' ? 'بيانات المريض' : 'Patient Information'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewPatientInline(!isCreatingNewPatientInline)}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  {isCreatingNewPatientInline
                    ? state.language === 'ar'
                      ? '← اختيار من قائمة المرضى'
                      : '← Select existing'
                    : state.language === 'ar'
                    ? '+ كتابة اسم مريض جديد الآن'
                    : '+ Type new patient name'}
                </button>
              </div>

              {!isCreatingNewPatientInline ? (
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {state.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} - هوية: {p.nationalId} - جوال: {p.phone}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      اسم المريض
                    </label>
                    <input
                      type="text"
                      required
                      value={inlinePatientName}
                      onChange={(e) => setInlinePatientName(e.target.value)}
                      placeholder="اسم المريض الجديد..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      رقم الهوية / الإقامة
                    </label>
                    <input
                      type="text"
                      value={inlinePatientId}
                      onChange={(e) => setInlinePatientId(e.target.value)}
                      placeholder="10XXXXXXXX"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      رقم الجوال
                    </label>
                    <input
                      type="text"
                      value={inlinePhone}
                      onChange={(e) => setInlinePhone(e.target.value)}
                      placeholder="+9665..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Test Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {state.language === 'ar' ? 'نوع التحليل المطلوب' : 'Test Type'}
              </label>
              <select
                value={newTestTypeId}
                onChange={(e) => setNewTestTypeId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {state.testTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr} ({t.nameEn}) - زمن قياسي: {t.turnaroundMinutes} دقيقة - {t.sampleType}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Phlebotomy Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {state.language === 'ar' ? 'أولوية الفحص' : 'Priority'}
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TestOrder['priority'])}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="routine">{state.language === 'ar' ? 'عادي (Routine)' : 'Routine'}</option>
                  <option value="urgent">{state.language === 'ar' ? 'عاجل (Urgent)' : 'Urgent'}</option>
                  <option value="stat">{state.language === 'ar' ? 'حرج فوري (STAT)' : 'STAT (Emergency)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {state.language === 'ar' ? 'محطة / غرفة سحب العينات' : 'Phlebotomy Room'}
                </label>
                <select
                  value={newCounterRoom}
                  onChange={(e) => setNewCounterRoom(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="غرفة سحب العينات 1">غرفة سحب العينات 1</option>
                  <option value="غرفة سحب العينات 2">غرفة سحب العينات 2</option>
                  <option value="غرفة سحب العينات 3">غرفة سحب العينات 3</option>
                  <option value="المختبر المركزي">المختبر المركزي</option>
                </select>
              </div>
            </div>

            {/* Workload Preview */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-teal-600" />
                <div>
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                    {state.language === 'ar' ? 'الوقت التقديري المحسوب للنتيجة:' : 'Calculated Turnaround Time:'}
                  </span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300">
                    {state.language === 'ar'
                      ? 'محتسب آلياً بناءً على عبء العمل اللحظي في المختبر'
                      : 'Smart estimation factoring active lab load'}
                  </span>
                </div>
              </div>
              <span className="text-xl font-black text-teal-700 dark:text-teal-300 font-mono-numbers">
                ~ {store.calculateEstimatedMinutes(newTestTypeId)} دقيقة
              </span>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              {state.orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubTab('worklist')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  {state.language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition"
              >
                {state.language === 'ar' ? 'تسجيل العينة وتوليد التذكرة + SMS' : 'Register Sample & Send SMS'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* WORKLIST & RAPID RESULT ENTRY MATRIX */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Worklist of Orders (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {state.language === 'ar' ? 'قائمة العينات والفحوصات النشطة' : 'Active Lab Worklist'}
                </h2>
                <span className="text-xs text-slate-400">
                  {state.orders.length} {state.language === 'ar' ? 'طلبات مسجلة' : 'total orders'}
                </span>
              </div>
            </div>

            {state.orders.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  {state.language === 'ar' ? 'لا توجد طلبات مسجلة حالياً.' : 'No orders in worklist.'}
                </p>
                <button
                  onClick={() => setSubTab('new_sample')}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  {state.language === 'ar' ? '+ تسجيل عينة فحص جديدة' : '+ New Sample'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {state.orders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  const hasCritical = order.results.some((r) => r.flag === 'critical');
                  const hasDelta = order.results.some((r) => r.deltaFlag);

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full text-start p-3.5 rounded-2xl border transition relative ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs font-mono-numbers text-slate-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : order.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}
                        >
                          {order.status === 'approved'
                            ? 'معتمد'
                            : order.status === 'pending_approval'
                            ? 'بانتظار الطبيب'
                            : order.status === 'processing'
                            ? 'قيد الإدخال'
                            : 'مستلم'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {order.patient.fullName}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{order.testType.nameAr}</span>
                        <span className="font-mono-numbers font-bold text-teal-700 dark:text-teal-400">
                          تذكرة: {order.ticketNumber || '-'}
                        </span>
                      </div>

                      {(hasCritical || hasDelta) && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {hasCritical && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md animate-pulse">
                              🚨 قيمة حرجة
                            </span>
                          )}
                          {hasDelta && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                              ⚠️ تباين Delta Check
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Rapid Results Entry Matrix & Auto Ranges (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {currentOrder ? (
              <form onSubmit={handleSubmitResults} className="space-y-5">
                {/* Order Summary Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-slate-900 dark:text-white">
                        {currentOrder.testType.nameAr}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 font-mono-numbers">
                        {currentOrder.barcode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentOrder.patient.fullName} • هوية: {currentOrder.patient.nationalId} • عينة:{' '}
                      {currentOrder.testType.sampleType}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {state.language === 'ar' ? 'الحالة الحالية:' : 'Status:'}
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
                      {currentOrder.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-teal-800 dark:text-teal-200 bg-teal-50/80 dark:bg-teal-950/40 px-3 py-2 rounded-xl">
                  <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {state.language === 'ar'
                      ? 'إدخال قياسات مباشر: اكتب الأرقام وسيتم تصنيفها آلياً إلى طبيعي أو مرتفع أو منخفض أو حرج.'
                      : 'Rapid entry enabled: Values are automatically flagged against reference intervals.'}
                  </span>
                </div>

                {/* Parameters Table Matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5 px-2 text-start">المؤشر المخبري</th>
                        <th className="py-2.5 px-2 text-start">القيمة المقاسة</th>
                        <th className="py-2.5 px-2 text-start">الوحدة</th>
                        <th className="py-2.5 px-2 text-start">النطاق الطبيعي</th>
                        <th className="py-2.5 px-2 text-center">التصنيف الآلي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentOrder.testType.parameters.map((param) => {
                        const currentInput = entryValues[param.id]?.value || '';
                        const numVal = parseFloat(currentInput);
                        const isEntered = currentInput !== '' && !isNaN(numVal);

                        let flag: 'normal' | 'low' | 'high' | 'critical' = 'normal';
                        if (isEntered) {
                          flag = store.evaluateFlag(
                            numVal,
                            param.minNormal,
                            param.maxNormal,
                            param.criticalLow,
                            param.criticalHigh
                          );
                        }

                        const delta = isEntered
                          ? store.findDeltaCheck(
                              currentOrder.patientId,
                              param.code,
                              numVal,
                              param.deltaTolerancePercent
                            )
                          : { deltaFlag: false };

                        return (
                          <tr key={param.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-2">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {param.nameAr}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{param.code}</div>
                            </td>

                            <td className="py-3 px-2">
                              <input
                                type="number"
                                step="any"
                                value={currentInput}
                                onChange={(e) => handleValueChange(param.id, e.target.value)}
                                placeholder={`${param.minNormal} - ${param.maxNormal}`}
                                className={`w-28 rounded-xl border p-2 text-xs font-bold font-mono-numbers focus:outline-none focus:ring-2 transition ${
                                  !isEntered
                                    ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    : flag === 'critical'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 focus:ring-rose-500'
                                    : flag === 'high'
                                    ? 'border-amber-500 bg-amber-50 text-amber-800 focus:ring-amber-500'
                                    : flag === 'low'
                                    ? 'border-sky-500 bg-sky-50 text-sky-800 focus:ring-sky-500'
                                    : 'border-emerald-500 bg-emerald-50 text-emerald-800 focus:ring-emerald-500'
                                }`}
                              />
                            </td>

                            <td className="py-3 px-2 font-mono text-[11px] text-slate-500 font-semibold">
                              {param.unit}
                            </td>

                            <td className="py-3 px-2 font-mono-numbers text-[11px] text-slate-600 dark:text-slate-400">
                              {param.minNormal} - {param.maxNormal}
                            </td>

                            <td className="py-3 px-2 text-center">
                              {!isEntered ? (
                                <span className="text-[11px] text-slate-400">-</span>
                              ) : (
                                <div className="space-y-1">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                                      flag === 'critical'
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : flag === 'high'
                                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                        : flag === 'low'
                                        ? 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300'
                                        : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                    }`}
                                  >
                                    {flag === 'critical'
                                      ? 'حرج Critical'
                                      : flag === 'high'
                                      ? 'مرتفع High'
                                      : flag === 'low'
                                      ? 'منخفض Low'
                                      : 'طبيعي Normal'}
                                  </span>

                                  {delta.deltaFlag && (
                                    <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                                      Delta ({delta.deltaChangePercent && delta.deltaChangePercent > 0 ? `+${delta.deltaChangePercent}` : delta.deltaChangePercent}%)
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {state.language === 'ar' ? 'ملاحظات الفني المخبري' : 'Technologist Clinical Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="ملاحظات العينة والجهاز..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    {state.language === 'ar'
                      ? 'عند حفظ النتائج، ستتحول فوراً إلى "بانتظار الاعتماد الطبي" ليراجعها الطبيب.'
                      : 'Saving transfers order to Doctor Portal for review.'}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-lg shadow-teal-600/30 active:scale-95 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>{state.language === 'ar' ? 'حفظ وتحويل النتائج للاعتماد الطبي' : 'Save & Submit to Doctor'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <p>{state.language === 'ar' ? 'لا توجد عينة محددة. قم بتسجيل عينة جديدة لبدء الإدخال.' : 'No sample selected.'}</p>
                <button
                  onClick={() => setSubTab('new_sample')}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  {state.language === 'ar' ? 'تسجيل عينة فحص جديدة' : 'Register Sample'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
