export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-3 border-mt-aqua border-t-transparent rounded-full animate-spin" />
      {message && <p className="text-sm text-mt-grey">{message}</p>}
    </div>
  );
}
