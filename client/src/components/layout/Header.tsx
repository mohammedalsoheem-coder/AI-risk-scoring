import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function Header() {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <header className="bg-mt-dark-green text-white h-16 flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-mt-light-aqua font-bold tracking-wide">
            {t('app.ministryAr')} | {t('app.ministry')}
          </span>
          <span className="text-lg font-bold">{t('app.title')}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-300 hidden sm:block">
          {t('app.subtitle')}
        </span>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-sm"
        >
          <Globe size={14} />
          {i18n.language === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>
    </header>
  );
}
