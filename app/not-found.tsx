import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-amber-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">صفحه مورد نظر یافت نشد</h2>
      <p className="text-slate-400 mb-6">صفحه‌ای که به دنبال آن بودید وجود ندارد یا منتقل شده است.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all"
      >
        بازگشت به بازی
      </Link>
    </div>
  );
}
