import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface Station { Title: string; StationNumber: number; IsEnabled: boolean; PlaylistSeconds: number; }
export interface Announcement { Id: number; Title: string; StationNumber: number; Message: string; StartsAt?: string; EndsAt?: string; IsActive: boolean; }
export interface Incident { Id: number; Title: string; StationNumber: number; DispatchId: string; Address: string; IncidentType: string; DispatchedAt: string; Status: string; }
export interface PlaylistItem { Id: number; Title: string; StationNumber: number; MediaUrl?: string | { Url: string }; DurationSeconds: number; IsEnabled: boolean; SortOrder: number; }

export class SharePointData {
  constructor(private readonly client: SPHttpClient, private readonly webUrl: string) {}

  private async list<T>(name: string, filter: string, orderBy?: string): Promise<T[]> {
    const query = new URLSearchParams();
    query.set('$top', '500');
    query.set('$filter', filter);
    if (orderBy) query.set('$orderby', orderBy);
    const url = this.webUrl.replace(/\/$/, '') +
      "/_api/web/lists/getbytitle('" + encodeURIComponent(name) + "')/items?" + query.toString();
    const response: SPHttpClientResponse = await this.client.get(
      url, SPHttpClient.configurations.v1, { headers: { Accept: 'application/json;odata=nometadata' } });
    if (!response.ok) throw new Error('SharePoint list ' + name + ': HTTP ' + response.status);
    const body = await response.json();
    return (body.value || []) as T[];
  }

  public stations(n: number): Promise<Station[]> {
    return this.list<Station>('FirehouseStations', 'StationNumber eq ' + n + ' and IsEnabled eq 1');
  }
  public announcements(n: number): Promise<Announcement[]> {
    return this.list<Announcement>('FirehouseAnnouncements', 'StationNumber eq ' + n + ' and IsActive eq 1');
  }
  public incidents(n: number): Promise<Incident[]> {
    return this.list<Incident>('FirehouseIncidents', 'StationNumber eq ' + n, 'DispatchedAt desc');
  }
  public playlist(n: number): Promise<PlaylistItem[]> {
    return this.list<PlaylistItem>('FirehousePlaylist', 'StationNumber eq ' + n + ' and IsEnabled eq 1', 'SortOrder asc');
  }
}
