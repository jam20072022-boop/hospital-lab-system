import React, { useState } from 'react';
import { AppState, store } from '../../services/store';
import { TestOrder } from '../../types/database';
import {
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  TrendingDown,
  FileText,
  FlaskConical,
  User,
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const DoctorPortal: React.FC<Props> = ({ state }) => {
  const pendingOrders = state.orders.filter((o) => o.status === 'pending_approval');
  const allDoctorOrders = state.orders;

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    pendingOrders[0]?.id || allDoctorOrders[0]?.id || ''
  );
  const [doctorComments, setDoctorComments] = useState<string>('');
  const [doctorSignName, setDoctorSignName] = useState<string>('الطبيب الاستشاري المعالج');
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const selectedOrder = state.orders.find((o) => o.id === selectedOrderId);

  React.useEffect(() => {
    if (selectedOrder) {
      setDoctorComments(selectedOrder.overallComments || '');
      if (selectedOrder.doctorName) {
        setDoctorSignName(selectedOrder.doctorName);
      }
    }
  }, [selectedOrderId, selectedOrder]);

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setIsApproving(true);
    await store.approveAndSignOrder(selectedOrder.id, doctorComments, doctorSignName);
    setIsApproving(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-teal-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold shadow-inner">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black">
                {state.language === 'ar' ? 'بوابة الطبيب والاستشاري - الاعتماد الطبي' : 'Doctor & Clinical Validation'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                SCHS Accredited
              </span>
            </div>
            <p className="text-xs text-teal-200/80 mt-1">
              {state.language === 'ar'
                ? 'تدقيق ومطابقة النتائج المخبرية، فحص تباين Delta Check، والاعتماد والتوقيع الرقمي'
                : 'Medical verification, Delta Checks, and official cryptographic signing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
            <span className="text-[10px] font-medium text-teal-200 block">
              {state.language === 'ar' ? 'فحوصات بانتظار الاعتماد' : 'Pending Approval'}
            </span>
            <span className="text-xl font-black font-mono-numbers text-white">
              {pendingOrders.length}
            </span>
          </div>
        </div>
      </div>

      {allDoctorOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {state.language === 'ar' ? 'لا توجد فحوصات معلقة للاعتماد حالياً' : 'No Pending Cases'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {state.language === 'ar'
              ? 'النظام مهيأ ونظيف تماماً لتختبره بنفسك. اذهب الآن إلى لوحة (فني المختبر) لتسجيل عينة وإدخال نتائج الفحص وسوف تظهر هنا فوراً لتدقيقها واعتمادها.'
              : 'The system is ready for fresh testing. Go to Lab Tech portal to register a sample and enter results.'}
          </p>
          <button
            onClick={() => store.setActiveTab('lab_tech')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition"
          >
            <FlaskConical className="w-4 h-4" />
            <span>{state.language === 'ar' ? 'الانتقال إلى لوحة فني المختبر لبدء الفحص' : 'Go to Lab Tech Portal'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Orders List (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {state.language === 'ar' ? 'الفحوصات المحالة' : 'Referred Cases'}
              </h2>
              <span className="text-xs text-slate-400 font-mono-numbers">
                {allDoctorOrders.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {allDoctorOrders.map((order) => {
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
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
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
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {order.status === 'approved'
                          ? 'معتمد ✓'
                          : order.status === 'pending_approval'
                          ? 'تدقيق طبي مطلوب'
                          : 'مسجل'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {order.patient.fullName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{order.testType.nameAr}</span>
                      <span className="font-mono-numbers">{order.priority.toUpperCase()}</span>
                    </div>

                    {(hasCritical || hasDelta) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {hasCritical && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md animate-pulse">
                            🚨 قيمة حرجة
                          </span>
                        )}
                        {hasDelta && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            ⚠️ تنبيه دلتا تشيك
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Inspection & Delta Check Engine (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {selectedOrder ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedOrder.testType.nameAr}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono-numbers">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedOrder.patient.fullName} • هوية: {selectedOrder.patient.nationalId} • فصيلة الدم: {selectedOrder.patient.bloodType}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrder.status === 'approved' ? (
                      <button
                        onClick={() => store.setSelectedOrderForReport(selectedOrder.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{state.language === 'ar' ? 'معاينة التقرير الطبي PDF' : 'View PDF Report'}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{state.language === 'ar' ? 'بانتظار الاعتماد الطبي' : 'Awaiting Approval'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* DELTA CHECK HIGHLIGHT BANNER */}
                {selectedOrder.results.some((r) => r.deltaFlag) && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>
                        {state.language === 'ar'
                          ? 'تنبيه التحقق المقارن (Delta Check Alert): تم رصد تباين غير فسيولوجي مفاجئ!'
                          : 'Delta Check Alert: Unexpected sudden physiological deviation detected!'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-200 leading-relaxed">
                      {state.language === 'ar'
                        ? 'أظهرت المؤشرات تغيراً حاداً يتجاوز حد التسامح الطبيعي مقارنة بآخر فحص لنفس المريض. يرجى التأكد من عدم وجود خلط في العينات قبل التوقيع.'
                        : 'Values indicate extreme deviation compared to previous records.'}
                    </p>
                  </div>
                )}

                {/* Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5 px-2 text-start">المؤشر</th>
                        <th className="py-2.5 px-2 text-start">القيمة الحالية</th>
                        <th className="py-2.5 px-2 text-start">النطاق الطبيعي</th>
                        <th className="py-2.5 px-2 text-start">آخر فحص سابق</th>
                        <th className="py-2.5 px-2 text-center">نسبة التباين (Delta %)</th>
                        <th className="py-2.5 px-2 text-center">التقييم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.results.map((res) => (
                        <tr
                          key={res.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                            res.deltaFlag ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-2">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {res.parameterNameAr}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{res.parameterCode}</div>
                          </td>

                          <td className="py-3 px-2">
                            <span
                              className={`text-sm font-black font-mono-numbers ${
                                res.flag === 'critical'
                                  ? 'text-rose-600'
                                  : res.flag === 'high'
                                  ? 'text-amber-600'
                                  : res.flag === 'low'
                                  ? 'text-sky-600'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {res.measuredValue}
                            </span>{' '}
                            <span className="text-[10px] text-slate-400 font-semibold">{res.unit}</span>
                          </td>

                          <td className="py-3 px-2 font-mono-numbers text-[11px] text-slate-500">
                            {res.minNormal} - {res.maxNormal}
                          </td>

                          <td className="py-3 px-2">
                            {res.previousValue !== undefined ? (
                              <div>
                                <span className="font-bold font-mono-numbers text-slate-700 dark:text-slate-300">
                                  {res.previousValue}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono-numbers">
                                  {res.previousDate}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">فحص أولي</span>
                            )}
                          </td>

                          <td className="py-3 px-2 text-center">
                            {res.deltaChangePercent !== undefined ? (
                              <span
                                className={`inline-flex items-center gap-1 font-mono-numbers font-bold text-[11px] px-2 py-0.5 rounded-lg ${
                                  res.deltaFlag
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {res.deltaChangePercent > 0 ? (
                                  <TrendingUp className="w-3 h-3 text-amber-600" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-emerald-600" />
                                )}
                                <span>{res.deltaChangePercent > 0 ? `+${res.deltaChangePercent}%` : `${res.deltaChangePercent}%`}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                res.flag === 'critical'
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : res.flag === 'high'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : res.flag === 'low'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {res.flag === 'critical'
                                ? 'حرج'
                                : res.flag === 'high'
                                ? 'مرتفع'
                                : res.flag === 'low'
                                ? 'منخفض'
                                : 'طبيعي'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Custom Doctor Name & Comments Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {state.language === 'ar' ? 'اسم الطبيب / الاستشاري المعتمد للتوقيع' : 'Certifying Doctor Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={doctorSignName}
                        onChange={(e) => setDoctorSignName(e.target.value)}
                        placeholder="اكتب اسمك أو صفة الاستشاري هنا..."
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {state.language === 'ar' ? 'التوصيات الإكلينيكية' : 'Clinical Comments'}
                    </label>
                    <input
                      type="text"
                      value={doctorComments}
                      onChange={(e) => setDoctorComments(e.target.value)}
                      placeholder="توصيات الاستشاري للتقرير..."
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Approval & Signing Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {state.language === 'ar' ? 'الاعتماد والتوقيع الرقمي المشفر' : 'Cryptographic Approval'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {doctorSignName} • SHA-256 Stamp
                      </div>
                    </div>
                  </div>

                  {selectedOrder.status === 'approved' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{state.language === 'ar' ? 'معتمد وموقع رقمياً' : 'Approved & Signed'}</span>
                      </span>
                      <button
                        onClick={() => store.setSelectedOrderForReport(selectedOrder.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
                      >
                        {state.language === 'ar' ? 'عرض التقرير' : 'View PDF'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-lg shadow-teal-600/30 active:scale-95 transition"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>
                        {isApproving
                          ? 'جارِ التوقيع وتوليد البصمة...'
                          : state.language === 'ar'
                          ? `اعتماد وتوقيع التقرير باسم (${doctorSignName})`
                          : 'Sign & Officially Approve'}
                      </span>
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
