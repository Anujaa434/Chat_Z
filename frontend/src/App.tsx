import { useEffect, useState } from "react";
import StatusCard from "./components/StatusCard";
import { apiGet } from "./lib/api";

type Health = { ok: boolean };

export default function App() {
  const [api, setApi] = useState<"OK" | "FAIL" | "...">("...");
  const [db, setDb] = useState<"OK" | "FAIL" | "...">("...");

  useEffect(() => {
    apiGet<Health>("/health")
      .then(d => setApi(d.ok ? "OK" : "FAIL"))
      .catch(() => setApi("FAIL"));

    apiGet<Health>("/health/db")
      .then(d => setDb(d.ok ? "OK" : "FAIL"))
      .catch(() => setDb("FAIL"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Connection Status</h1>
        <StatusCard label="API" status={api} />
        <StatusCard label="Database" status={db} />
        <p className="text-xs text-gray-500">
          Base URL: <code>{import.meta.env.VITE_API_URL}</code>
        </p>
      </div>
    </div>
  );
}
