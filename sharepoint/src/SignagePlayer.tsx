import * as React from 'react';
import { PlaylistItem } from './SharePointData';
import { mediaKind, mediaSource, orderedItems } from './playlist';
export interface SignagePlayerProps { items: PlaylistItem[]; station: number; }
export const SignagePlayer: React.FC<SignagePlayerProps> = ({items,station}) => {
  const eligible = React.useMemo(() => orderedItems(items), [items]);
  const [index,setIndex] = React.useState(0);
  const item = eligible.length ? eligible[index % eligible.length] : undefined;
  const url = item ? mediaSource(item) : undefined;
  const kind = mediaKind(url);
  const seconds = Math.max(5, Math.min(3600, Number(item?.DurationSeconds || 45)));

  React.useEffect(() => { setIndex(0); }, [station]);
  React.useEffect(() => {
    if (eligible.length < 2) return;
    const timer = window.setTimeout(() => setIndex(n => n + 1), seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [eligible, seconds, index]);
  if (!item || !url) return <p>No approved media currently assigned to this station.</p>;
  const common = {width:'100%',height:'60vh',objectFit:'contain' as const,background:'#000'};
  return <div aria-label={'Station '+station+' signage'} style={{width:'100%'}}>
    {kind === 'image' && <img key={url} src={url} alt={item.Title || 'Station media'} style={common}/>}
    {kind === 'video' && <video key={url} src={url} autoPlay muted playsInline controls={false}
      onEnded={() => setIndex(n => n+1)} style={common} />}
    {kind === 'pdf' && <iframe key={url} title={item.Title || 'Station document'} src={url}
      style={{width:'100%',height:'60vh',border:0,background:'#fff'}}/>}
    {kind === 'external' && <div style={{padding:24,background:'#13233c'}}>
      <strong>{item.Title}</strong><p>External web content is not automatically embedded for security and compatibility.</p>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{color:'#bfdbfe'}}>Open approved content</a>
    </div>}
    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,color:'#cbd5e1'}}>
      <span>{item.Title}</span><span>{index % eligible.length + 1} / {eligible.length}</span>
    </div>
  </div>;
};
