export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600"
        aria-hidden="true"
      />
      {label ? <span className="text-sm font-semibold">{label}</span> : null}
    </div>
  );
}

