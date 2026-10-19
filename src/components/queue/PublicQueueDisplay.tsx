import React, { useState, useEffect } from 'react';
import { AppState, store } from '../../services/store';
import { soundService } from '../../services/audio';
import {
  Tv,
  Volume2,
  Maximize2,
  Clock,
  Sparkles,
  ArrowRight,
  Activity,
  Users,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const PublicQueueDisplay: React.FC<Props> = ({ state }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString(state.language === 'ar' ? 'ar-SA' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [state.language]);

  // Current called tickets (status 'called' or 'in_progress')
  const servingTickets = state.tickets
    .filter((t) => t.status === 'called' || t.status === 'in_progress')
    .slice(-3)
    .reverse();

  const mainServing = servingTickets[0] || state.tickets.find((t) => t.status === 'called');

  // Waiting tickets (next up)
  const waitingTickets = state.tickets.filter((t) => t.status === 'waiting');

  const triggerCallSimulation = (ticketId: string, room: string) => {
    store.callTicket(ticketId, room);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-8">
      {/* TV Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold text-2xl shadow-inner">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                MediLab <span className="text-teal-400">Queue TV</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                صالة الانتظار الرئيسية
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {state.language === 'ar'
                ? 'شاشة النداء الآلي وسحب العينات المخبرية الموحدة'
                : 'Automated Phlebotomy Call Screen'}
            </p>
          </div>
        </div>

        {/* Live Clock & Fullscreen Controls */}
        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between">
          <div className="text-end">
            <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-teal-400">
              {timeStr}
            </div>
            <div className="text-xs text-slate-400">{dateStr}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => soundService.playQueueChime()}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 transition"
              title="اختبار جرس التنبيه الصوتي"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
              title="وضع الشاشة الكاملة (TV Fullscreen)"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main TV Screen Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* BIG NOW SERVING HERO CARD (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-teal-500/50 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          {/* Subtle radar pulse glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-teal-300">
                  {state.language === 'ar' ? 'الدور الحالي المطلوب الآن' : 'NOW SERVING'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                {mainServing ? mainServing.serviceType : 'في انتظار الاستدعاء'}
              </span>
            </div>

            {mainServing ? (
              <div className="py-8 sm:py-12 text-center space-y-4">
                <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block">
                  {state.language === 'ar' ? 'رقم التذكرة' : 'TICKET NUMBER'}
                </span>
                <div className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-emerald-300 font-mono-numbers tracking-tight animate-pulse-slow">
                  {mainServing.ticketNumber}
                </div>

                <div className="pt-4">
                  <span className="inline-block px-6 py-3 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-200 text-lg sm:text-2xl font-black">
                    {state.language === 'ar' ? 'يرجى التوجه إلى:' : 'Proceed to:'}{' '}
                    <span className="text-white underline decoration-teal-400">
                      {mainServing.counterRoom}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <p className="text-xl font-bold">
                  {state.language === 'ar'
                    ? 'جميع المحطات متاحة حالياً، يرجى التوجه لمكتب الاستقبال'
                    : 'All stations currently available'}
                </p>
              </div>
            )}
          </div>

          {/* Recently Called Sub-Bar */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {servingTickets.slice(1).map((item) => (
              <div
                key={item.id}
                className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block">{item.counterRoom}</span>
                  <span className="text-lg font-black font-mono-numbers text-teal-400">
                    {item.ticketNumber}
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* NEXT UP / WAITING LIST COLUMN (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-base text-white">
                  {state.language === 'ar' ? 'التذاكر التالية بالانتظار' : 'NEXT IN LINE'}
                </h3>
              </div>
              <span className="text-xs font-mono-numbers bg-slate-800 px-2.5 py-1 rounded-full text-teal-300 font-bold">
                {waitingTickets.length} {state.language === 'ar' ? 'في الانتظار' : 'Waiting'}
              </span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {waitingTickets.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  {state.language === 'ar' ? 'لا توجد تذاكر تنتظر حالياً' : 'No waiting tickets'}
                </div>
              ) : (
                waitingTickets.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-teal-500/40 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center font-mono-numbers">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-base font-black font-mono-numbers text-white group-hover:text-teal-300 transition">
                          {ticket.ticketNumber}
                        </span>
                        <div className="text-[11px] text-slate-500">{ticket.serviceType}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono-numbers text-slate-400">
                        ~{ticket.estimatedWaitMinutes} د
                      </span>
                      <button
                        onClick={() => triggerCallSimulation(ticket.id, 'غرفة سحب العينات 1')}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold opacity-80 group-hover:opacity-100 transition"
                        title="نداء التذكرة فوراً"
                      >
                        نداء 🔔
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Notice footer */}
          <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-800/40 text-[11px] text-teal-300/90 leading-relaxed text-center">
            {state.language === 'ar'
              ? 'يرجى تجهيز بطاقة الهوية الوطنية والرمز الشريطي (Barcode) عند سماع رقمك.'
              : 'Please have your National ID ready when your number is called.'}
          </div>
        </div>
      </div>

      {/* TV Marquee / Hospital News Ticker */}
      <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
        <span className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-[10px] shrink-0">
          تنبيهات المختبر
        </span>
        <div className="truncate">
          {state.language === 'ar'
            ? 'مرحباً بكم في مختبرات MediLab Pro • جميع الفحوصات معتمدة وفق معايير ISO 15189 • نتائج السكر والدهون تصدر خلال 45 دقيقة • نرجو مراعاة التباعد والهدوء في صالة الانتظار.'
            : 'Welcome to MediLab Pro • ISO 15189 Accredited Lab • Fast turnaround times • Please proceed when called.'}
        </div>
      </div>
    </div>
  );
};
