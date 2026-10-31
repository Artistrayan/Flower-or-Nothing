import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gol Ya Pooch 3D Master | گل یا پوچ آنلاین حرفه‌ای',
  description: 'پلتفرم آنلاین و سه‌بعدی بازی حرفه‌ای گل یا پوچ؛ مسابقات دونفره، چهارنفره و گروهی با استیک سکه، کارت‌های بلوف، فروشگاه اسکین‌های سه‌بعدی دست و والِت اختصاصی.',
  openGraph: {
    title: 'Gol Ya Pooch 3D Master | گل یا پوچ آنلاین حرفه‌ای',
    description: 'پلتفرم آنلاین و سه‌بعدی بازی حرفه‌ای گل یا پوچ با ورودی سکه و گرافیک ۳ بعدی پیشرفته.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gol Ya Pooch 3D Master | گل یا پوچ آنلاین حرفه‌ای',
    description: 'پلتفرم آنلاین و سه‌بعدی بازی حرفه‌ای گل یا پوچ.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="bg-[#08090d] text-slate-100 antialiased selection:bg-amber-500 selection:text-black overflow-x-hidden font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
