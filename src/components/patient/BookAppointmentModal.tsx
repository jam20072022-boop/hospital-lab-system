import React, { useState } from 'react';
import { AppState, store } from '../../services/store';
import { Calendar, Clock, MapPin, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  state: AppState;
  onClose: () => void;
}

const BRANCHES = [
  'الفرع الرئيسي - الرياض (حي النخيل)',
  'فرع التخصصي - الرياض (شارع التخصصي)',
  'فرع غرب الرياض - طريق الملك فهد',
  'فرع جدة - حي الروضة',
  'فرع الدمام - حي الشاطئ',
];

const TIME_SLOTS = [
  '07:30 ص',
  '08:00 ص',
  '08:30 ص',
  '09:00 ص',
  '09:30 ص',
  '10:00 ص',
  '10:30 ص',
  '11:00 ص',
  '04:30 م',
  '05:00 م',
  '05:30 م',
];

export const BookAppointmentModal: React.FC<Props> = ({ state, onClose }) => {
  const patient = state.patients.find((p) => p.id === state.currentPatientId) || state.patients[0];
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedTests, setSelectedTests] = useState<string[]>([state.testTypes[0].id]);
  const [date, setDate] = useState('2026-10-26');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [notes, setNotes] = useState('يرجى تأكيد ما إذا كان الفحص يتطلب صياماً مسبقاً.');

  const toggleTest = (id: string) => {
    if (selectedTests.includes(id)) {
      if (selectedTests.length > 1) {
        setSelectedTests(selectedTests.filter((t) => t !== id));
      }
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    store.bookAppointment(patient.id, selectedTests, selectedBranch, date, timeSlot, notes);
    onClose();
  };

  const totalCost = selectedTests.reduce((acc, testId) => {
    const t = state.testTypes.find((x) => x.id === testId);
    return acc + (t ? t.price : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-fadeIn my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                {state.language === 'ar' ? 'حجز موعد سحب عينات مخبرية' : 'Book Phlebotomy Appointment'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {patient.fullName} ({patient.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBooking} className="mt-5 space-y-4">
          {/* Branch Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline text-teal-600 me-1" />
              {state.language === 'ar' ? 'اختيار الفرع / المركز المخبري' : 'Select Lab Branch'}
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Test Types (Multi-select) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {state.language === 'ar' ? 'الفحوصات والتحاليل المطلوبة' : 'Required Laboratory Tests'}
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-1">
              {state.testTypes.map((t) => {
                const isChecked = selectedTests.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTest(t.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-start transition ${
                      isChecked
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-white text-xs ${
                          isChecked ? 'bg-teal-600' : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">
                          {state.language === 'ar' ? t.nameAr : t.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-500">{t.sampleType}</div>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono-numbers text-slate-700 dark:text-slate-300">
                      {t.price} ر.س
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline text-teal-600 me-1" />
                {state.language === 'ar' ? 'تاريخ الموعد' : 'Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="2026-10-19"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline text-teal-600 me-1" />
                {state.language === 'ar' ? 'الوقت المفضل' : 'Time Slot'}
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {state.language === 'ar' ? 'ملاحظات خاصة أو أدوية' : 'Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: صائم لمدة 10 ساعات، أو أتناول علاج الغدة..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Cost Summary Box */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
              {state.language === 'ar' ? 'إجمالي التكلفة التقديرية:' : 'Estimated Total:'}
            </span>
            <span className="text-base font-black text-teal-700 dark:text-teal-300 font-mono-numbers">
              {totalCost} ر.س
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              {state.language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-xs font-bold text-white shadow-lg shadow-teal-600/30 hover:from-teal-700 hover:to-emerald-700 active:scale-95 transition"
            >
              {state.language === 'ar' ? 'تأكيد الحجز وإرسال SMS' : 'Confirm & Send SMS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
