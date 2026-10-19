import React, { useState } from 'react';
import { AppState, store } from '../../services/store';
import { soundService } from '../../services/audio';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Activity,
  UserCheck,
  FlaskConical,
  Stethoscope,
  Tv,
  ShieldCheck,
  Volume2,
  VolumeX,
  Languages,
  RotateCcw,
  Menu,
  X,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface Props {
  state: AppState;
}

export const Header: React.FC<Props> = ({ state }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.isMuted);

  const toggleSound = () => {
    soundService.isMuted = !soundService.isMuted;
    setIsMuted(soundService.isMuted);
    if (!soundService.isMuted) {
      soundService.playQueueChime();
    }
  };

  const pendingDoctorCount = state.orders.filter((o) => o.status === 'pending_approval').length;
  const inQueueCount = state.tickets.filter((t) => t.status === 'waiting' || t.status === 'called').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Lab Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => store.setActiveTab('patient')}
              className="flex items-center gap-3 text-start group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    MediLab<span className="text-teal-600 dark:text-teal-400">Pro</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    ISO 15189
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {state.language === 'ar'
                    ? 'نظام المختبرات الطبية وإدارة الطوابير الذكية'
                    : 'Medical Laboratory & Queue System'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            {/* Patient Portal */}
            <button
              onClick={() => store.setActiveTab('patient')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                state.activeTab === 'patient'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'بوابة المريض' : 'Patient Portal'}</span>
            </button>

            {/* Lab Staff Portal */}
            <button
              onClick={() => store.setActiveTab('lab_tech')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                state.activeTab === 'lab_tech'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'فني المختبر' : 'Lab Tech'}</span>
            </button>

            {/* Doctor Verification */}
            <button
              onClick={() => store.setActiveTab('doctor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                state.activeTab === 'doctor'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'اعتماد الطبيب' : 'Doctor Portal'}</span>
              {pendingDoctorCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingDoctorCount}
                </span>
              )}
            </button>

            {/* Public Queue TV Display */}
            <button
              onClick={() => store.setActiveTab('queue_display')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                state.activeTab === 'queue_display'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'شاشة صالة الانتظار (TV)' : 'Queue TV'}</span>
              {inQueueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            {/* Audit & SMS */}
            <button
              onClick={() => store.setActiveTab('audit_sms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                state.activeTab === 'audit_sms'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'الأمان والـ SMS' : 'Audit & SMS'}</span>
            </button>
          </nav>

          {/* Right Action Tools: Language, Sound, PWA, User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'تفعيل تنبيهات الطابور الصوتية' : 'كتم التنبيهات الصوتية'}
              className={`p-2 rounded-xl text-xs font-semibold transition ${
                isMuted
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Language Switch */}
            <button
              onClick={() => store.setLanguage(state.language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              title="تغيير اللغة / Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{state.language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton lang={state.language} />


            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 animate-fadeIn">
            <button
              onClick={() => {
                store.setActiveTab('patient');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                state.activeTab === 'patient'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>{state.language === 'ar' ? 'بوابة المريض (تتبع الطابور والنتائج)' : 'Patient Portal'}</span>
              </div>
            </button>

            <button
              onClick={() => {
                store.setActiveTab('lab_tech');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                state.activeTab === 'lab_tech'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>{state.language === 'ar' ? 'لوحة فني ومسؤول المختبر' : 'Lab Staff Portal'}</span>
              </div>
            </button>

            <button
              onClick={() => {
                store.setActiveTab('doctor');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                state.activeTab === 'doctor'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>{state.language === 'ar' ? 'بوابة الطبيب والاعتماد (Delta Check)' : 'Doctor Portal'}</span>
              </div>
              {pendingDoctorCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingDoctorCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                store.setActiveTab('queue_display');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                state.activeTab === 'queue_display'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tv className="w-4 h-4 text-teal-600" />
                <span>{state.language === 'ar' ? 'شاشة صالة الانتظار العامة (TV)' : 'Queue TV Display'}</span>
              </div>
            </button>

            <button
              onClick={() => {
                store.setActiveTab('audit_sms');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                state.activeTab === 'audit_sms'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>{state.language === 'ar' ? 'سجل رسائل SMS والأمان الطبي' : 'Audit & SMS Logs'}</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Global Notification Banner */}
      {state.notificationBanner && (
        <div
          className={`px-4 py-2 text-center text-xs sm:text-sm font-semibold transition-all ${
            state.notificationBanner.type === 'success'
              ? 'bg-emerald-600 text-white'
              : state.notificationBanner.type === 'alert'
              ? 'bg-rose-600 text-white'
              : 'bg-teal-700 text-white'
          }`}
        >
          {state.notificationBanner.message}
        </div>
      )}
    </header>
  );
};
