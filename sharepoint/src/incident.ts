export interface DispatchIncident {
  Id: number;
  Title: string;
  DispatchId: string;
  Address: string;
  IncidentType: string;
  DispatchedAt: string;
  Status: string;
}
export function activeIncident<T extends DispatchIncident>(incidents: T[], nowMs: number, takeoverMinutes: number): T | undefined {
  const maxAgeMs = Math.max(1, takeoverMinutes) * 60000;
  return incidents.filter(incident => {
    const dispatchedAt = Date.parse(incident.DispatchedAt || '');
    if (!Number.isFinite(dispatchedAt)) return false;
    const age = nowMs - dispatchedAt;
    if (age < 0 || age >= maxAgeMs) return false;
    const status = String(incident.Status || '').toLowerCase().trim();
    return !['closed', 'cancelled', 'canceled', 'cleared', 'complete', 'completed'].indexOf(status) !== -1;
  }).sort((a, b) => Date.parse(b.DispatchedAt) - Date.parse(a.DispatchedAt))[0];
}
