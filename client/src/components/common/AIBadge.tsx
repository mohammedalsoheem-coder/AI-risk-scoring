import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function AIBadge() {
  const { t } = useTranslation();
  return (
    <span className="ai-badge">
      <Sparkles size={12} />
      {t('common.aiGenerated')}
    </span>
  );
}
