import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { Announcement, Incident, PlaylistItem, SharePointData } from './SharePointData';
import { SignagePlayer } from './SignagePlayer';
import { activeIncident } from './incident';

export interface DashboardProps {
  spHttpClient: SPHttpClient;
  webUrl: string;
  stationNumber?: number;
  refreshSeconds?: number;
  takeoverMinutes?: number;
}

export const FirehouseDashboard: React.FC<DashboardProps> = (props) => {
  const station = props.stationNumber || 1;
  const provider = React.useMemo(() => new SharePointData(props.spHttpClient, props.webUrl), [props.spHttpClient, props.webUrl]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [playlist, setPlaylist] = React.useState<PlaylistItem[]>([]);
  const [now, setNow] = React.useState(Date.now());
  const [error, setError] = React.useState('');
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    let active = true;
    const refresh = async (): Promise<void> => {
      try {
        const [nextAnnouncements, nextIncidents, nextPlaylist] = await Promise.all([
          provider.announcements(station), provider.incidents(station), provider.playlist(station)
        ]);
        if (!active) return;
        setAnnouncements(nextAnnouncements);
        setIncidents(nextIncidents);
        setPlaylist(nextPlaylist);
        setError('');
        setHasLoaded(true);
        setLastUpdatedAt(Date.now());
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      }
    };
    void refresh();
    const refreshTimer = window.setInterval(() => void refresh(), Math.max(10, props.refreshSeconds || 15) * 1000);
    const clockTimer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; window.clearInterval(refreshTimer); window.clearInterval(clockTimer); };
  }, [provider, station, props.refreshSeconds]);

  const minutes = Math.max(1, props.takeoverMinutes || 5);
  const dataFresh = lastUpdatedAt !== undefined && (now - lastUpdatedAt) < Math.max(60, (props.refreshSeconds || 15) * 3) * 1000;
  const live = dataFresh ? activeIncident(incidents, now, minutes) : undefined;
  const activeAnnouncements = announcements.filter(a =>
    (!a.StartsAt || Date.parse(a.StartsAt) <= now) && (!a.EndsAt || Date.parse(a.EndsAt) > now));

  return <section style={{background:'#09111e',color:'#f8fafc',minHeight:620,padding:24,fontFamily:'Segoe UI, sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #334155'}}>
      <h1>FIREHOUSE — STATION {station}</h1>
      <strong>{new Date(now).toLocaleString('en-US',{timeZone:'America/Chicago'})}</strong>
    </header>
    {!hasLoaded && !error && <p role="status">Loading station information...</p>}
    {error && <p role="alert">Data update failed: {error}. Dispatch data may be stale.</p>}
    {!dataFresh && hasLoaded && <p role="alert" style={{background:'#78350f',padding:12,fontWeight:700}}>DATA CONNECTION STALE — THIS DISPLAY IS NOT AN OPERATIONAL DISPATCH SYSTEM.</p>}
    {live ? <article role="alert" style={{marginTop:22,padding:32,background:'#7f1d1d',border:'4px solid #ef4444'}}>
      <h2>ACTIVE DISPATCH — {live.IncidentType || live.Title}</h2>
      <p style={{fontSize:36,fontWeight:700}}>{live.Address}</p>
      <p>Dispatched: {new Date(live.DispatchedAt).toLocaleString()}</p>
    </article> : <main style={{marginTop:22}}>
      <SignagePlayer items={playlist} station={station}/>
      {activeAnnouncements.map(a => <article key={a.Id} style={{marginTop:16,padding:16,background:'#1e293b'}}>
        <h2>{a.Title}</h2><p>{a.Message}</p>
      </article>)}
    </main>}
  </section>;
};
