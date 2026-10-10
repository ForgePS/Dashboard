import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import { Incident, SharePointData } from './SharePointData';
import { activeIncident } from './incident';

export interface MvixActive911WrapperProps {
  spHttpClient: SPHttpClient;
  webUrl: string;
  stationNumber?: number;
  mvixPlaybackUrl?: string;
  refreshSeconds?: number;
  takeoverMinutes?: number;
}

const DEFAULT_MVIX = 'https://vp-iqewtzht.cms.mvix.com/playback';

export const MvixActive911Wrapper: React.FC<MvixActive911WrapperProps> = props => {
  const station = props.stationNumber || 1;
  const provider = React.useMemo(() => new SharePointData(props.spHttpClient, props.webUrl),
    [props.spHttpClient, props.webUrl]);
  const [incidents,setIncidents] = React.useState<Incident[]>([]);
  const [now,setNow] = React.useState(Date.now());
  const [lastSuccess,setLastSuccess] = React.useState<number | undefined>(undefined);
  const [loadedStation,setLoadedStation] = React.useState<number | undefined>(undefined);
  const [error,setError] = React.useState('');
  const refreshMs = Math.max(10, props.refreshSeconds || 15) * 1000;

  React.useEffect(() => {
    let disposed = false;
    const load = async (): Promise<void> => {
      try {
        const next = await provider.incidents(station);
        if (!disposed) {
          setIncidents(next);
          setLoadedStation(station);
          setLastSuccess(Date.now());
          setError('');
        }
      } catch (err) {
        if (!disposed) setError(err instanceof Error ? err.message : String(err));
      }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, refreshMs);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { disposed = true; window.clearInterval(timer); window.clearInterval(clock); };
  }, [provider, station, refreshMs]);

  const fresh = loadedStation === station && lastSuccess !== undefined &&
    now-lastSuccess <= Math.max(60000, refreshMs*3);
  const live = fresh ? activeIncident(incidents,now,props.takeoverMinutes || 5) : undefined;
  let playbackUrl: string | undefined;
  try {
    const url = new URL(props.mvixPlaybackUrl || DEFAULT_MVIX);
    if (url.protocol === 'https:') playbackUrl = url.toString();
  } catch { /* bad config */ }

  return <section style={{position:'relative',width:'100%',height:'100vh',minHeight:'640px',background:'#000',color:'white',overflow:'hidden'}}>
    {playbackUrl
      ? <iframe title={'Station '+station+' MVIX playback'} src={playbackUrl}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          style={{width:'100%',height:'100%',border:0}}/>
      : <p style={{padding:24}}>Configure a valid HTTPS MVIX playback URL.</p>}
    {live && <div role="alert" style={{position:'absolute',inset:0,zIndex:10,background:'#530b10',padding:'5vw',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center'}}>
      <h1 style={{fontSize:'4vw'}}>ACTIVE911 DISPATCH — STATION {station}</h1>
      <h2 style={{fontSize:'5vw'}}>{live.IncidentType || live.Title || 'INCIDENT'}</h2>
      <p style={{fontSize:'3vw'}}>{live.Address || 'Address unavailable'}</p>
      <p>Dispatched {new Date(live.DispatchedAt).toLocaleString()}</p>
    </div>}
    {(!fresh || error) && <div role="status" style={{position:'absolute',right:12,bottom:12,zIndex:20,padding:'8px 12px',background:'#78350f'}}>
      Active911 display feed {error ? 'unavailable' : 'not verified'} — MVIX continues; do not rely on this as dispatch alerting.
    </div>}
  </section>;
};
