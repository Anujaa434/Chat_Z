type Props = { label: string; status: "OK" | "FAIL" | "..."; };

export default function StatusCard({ label, status }: Props) {
  const color =
    status === "OK" ? "text-green-700 bg-green-50 border-green-200" :
    status === "FAIL" ? "text-red-700 bg-red-50 border-red-200" :
    "text-gray-700 bg-gray-50 border-gray-200";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${color}`}>
      <span className="mr-2 text-gray-500">{label}:</span>{status}
    </div>
  );
}
