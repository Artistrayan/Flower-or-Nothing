'use client';

import React from 'react';
import { X, HelpCircle, Shield, Sparkles, Percent, Crown, Hand, Swords } from 'lucide-react';
import { sound } from '@/lib/sound';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#111625] to-[#090c14] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">راهنمای بازی حرفه‌ای گل یا پوچ ۳D</h2>
              <p className="text-xs text-slate-400">قوانین مسابقات، کارت‌های شانس و نحوه کسر کمیسیون</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed flex-1">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>🎯</span>
              <span>هدف بازی چیست؟</span>
            </h3>
            <p>
              گل یا پوچ یکی از جذاب‌ترین بازی‌های روانشناختی و بلوف ایرانی است. در هر دست، یکی از تیم‌ها شیء ارزشمند («گل» یا الماس) را در یکی از مشت‌های بسته خود پنهان می‌کند. تیم مقابل باید با ارزیابی چهره، زبان بدن و استفاده از کارت‌های استراتژیک، تشخیص دهد کدام مشت پوچ (خالی) است یا ضربه نهایی گل را بزند.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>کارت‌های تاکتیکی مسابقات:</span>
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>
                <strong className="text-amber-300">کارت شاه‌گل: </strong>
                اگر با اولین حرکت مستقیماً مشت دارنده گل را حدس بزنید، ۲ امتیاز به شما می‌رسد.
              </li>
              <li>
                <strong className="text-pink-300">کارت بوی گل: </strong>
                سنسور ارتعاش مشت‌ها فعال شده و ارتعاش خفیف در دست مظنون به گل نمایش داده می‌شود.
              </li>
              <li>
                <strong className="text-cyan-300">کارت دست خالی: </strong>
                حریف مجبور به باز کردن یکی از دستان بدون گل خود به شکل کاملاً رایگان می‌شود.
              </li>
              <li>
                <strong className="text-rose-300">کارت دوئل: </strong>
                در بازی‌های تیمی، یاران سکوت کرده و سرنوشت دست در یک رویارویی تک‌به‌تک رقم می‌خورد.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>سیستم مالی و کارمزد کمیسیون پلتفرم:</span>
            </h3>
            <p>
              تمام بازی‌ها با ورودی سکه واقعی در داخل بازی انجام می‌شوند. مجموع مبالغ ورودی بازیکنان «استخر پات» را تشکیل می‌دهد. سیستم به صورت کاملاً خودکار و شفاف بین ۴٪ تا ۷٪ به عنوان کمیسیون پلتفرم کسر می‌کند و مانده پات بلافاصله پس از اتمام مسابقه به حساب برنده واریز می‌گردد.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Hand className="w-4 h-4 text-emerald-400" />
              <span>فروشگاه سه‌بعدی و پوزیشن‌های بلوف:</span>
            </h3>
            <p>
              می‌توانید با سکه‌های برنده شده، دست‌های سه‌بعدی لوکس (طلای ۲۴ عیار، سایبرپانک تیتانیومی، دستکش مخمل مافیایی)، مدل‌های نگین (سکه هخامنشی، مکعب کوانتومی) و پوزیشن‌های روانی مانند ضربه زدن به میز را خریداری کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
