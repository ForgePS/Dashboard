import { Incident } from './SharePointData';
export function activeIncident(incidents: Incident[], nowMs: number, takeoverMinutes: number): Incident | undefined {
  const maxAgeMs = Math.max(1, takeoverMinutes) * 60000;
  return incidents.filter(incident => {
    const dispatchedAt = Date.parse(incident.DispatchedAt || '');
    if (!Number.isFinite(dispatchedAt)) return false;
    const age = nowMs - dispatchedAt;
    if (age < 0 || age >= maxAgeMs) return false;
    const status = String(incident.Status || '').toLowerCase().trim();
    return !['closed','cancelled','canceled','cleared','complete','completed'].includes(status);
  }).sort((a,b) => Date.parse(b.DispatchedAt) - Date.parse(a.DispatchedAt))[0];
}
