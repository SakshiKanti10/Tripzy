export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900"
    >
      <div className="text-sm font-bold">Something went wrong</div>
      <div className="mt-1 text-xs opacity-90">{message}</div>
    </div>
  );
}

