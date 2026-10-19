/**
 * Audio Chime and Speech Synthesizer Service for Queue Display & Calling
 * Uses native Web Audio API & SpeechSynthesis (zero external audio asset dependencies)
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a distinct, pleasant 2-tone airport/hospital chime
   */
  public playQueueChime(): void {
    if (this.isMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Tone 1: High crisp ding
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.65);

      // Tone 2: Harmonious resolving bell
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.28); // A5
      gain2.gain.setValueAtTime(0.001, now + 0.28);
      gain2.gain.exponentialRampToValueAtTime(0.4, now + 0.33);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 1.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Speaks ticket announcement via Web Speech API
   */
  public announceTicket(ticketNumber: string, counterRoom: string, lang: 'ar' | 'en' = 'ar'): void {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      this.playQueueChime();

      setTimeout(() => {
        window.speechSynthesis.cancel(); // cancel pending speech
        const text = lang === 'ar'
          ? `تذكرة رقم ${ticketNumber.replace('-', ' ')}، يرجى التوجه إلى ${counterRoom}`
          : `Ticket ${ticketNumber}, please proceed to ${counterRoom}`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1.05;

        // Try to match preferred language voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => lang === 'ar' ? v.lang.startsWith('ar') : v.lang.startsWith('en'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
      }, 700);
    } catch {
      // Non-blocking fallback
    }
  }
}

export const soundService = new SoundService();
