import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <AlertCircle size={32} className="text-red-500" />
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
