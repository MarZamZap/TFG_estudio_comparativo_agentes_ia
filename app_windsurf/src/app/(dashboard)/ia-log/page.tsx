import { getIaLogs } from "@/actions/estadisticas";
import { IaLogClient } from "./ia-log-client";

export default async function IaLogPage() {
  const logs = await getIaLogs();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Log de Consultas IA</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Registro de auditoría de consultas al asistente de IA</p>
      </div>
      <IaLogClient data={JSON.parse(JSON.stringify(logs))} />
    </div>
  );
}
