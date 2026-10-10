import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface Station { Title: string; StationNumber: number; IsEnabled: boolean; PlaylistSeconds: number; }
export interface Announcement { Id: number; Title: string; StationNumber: number; Message: string; StartsAt?: string; EndsAt?: string; IsActive: boolean; }
export interface Incident { Id: number; Title: string; StationNumber: number; DispatchId: string; Address: string; IncidentType: string; DispatchedAt: string; Status: string; }
export interface PlaylistItem { Id: number; Title: string; StationNumber: number; MediaUrl?: string | { Url: string }; DurationSeconds: number; IsEnabled: boolean; SortOrder: number; }

interface ListResponse<T> {
  value?: T[];
  'odata.nextLink'?: string;
  '@odata.nextLink'?: string;
}

export class SharePointData {
  constructor(private readonly client: SPHttpClient, private readonly webUrl: string) {}

  private async list<T>(name: string, filter: string, orderBy?: string, limit: number = 500): Promise<T[]> {
    const base = this.webUrl.replace(/\/$/, '');
    const site = new URL(base);
    const query = new URLSearchParams();
    query.set('$top', String(Math.min(500, Math.max(1, limit))));
    query.set('$filter', filter);
    if (orderBy) query.set('$orderby', orderBy);
    const encodedName = name.replace(/'/g, "''");
    let next: string | undefined = base + "/_api/web/lists/getbytitle('" + encodedName + "')/items?" + query.toString();
    const values: T[] = [];
    const visited = new Set<string>();
    while (next && values.length < limit) {
      const url = new URL(next, base);
      if (url.origin !== site.origin || !url.pathname.startsWith(site.pathname.replace(/\/$/, '') + '/_api/')) {
        throw new Error('Rejected unexpected SharePoint paging URL');
      }
      if (visited.has(url.href)) throw new Error('Repeated SharePoint paging URL');
      visited.add(url.href);
      if (visited.size > 25) throw new Error('SharePoint paging limit exceeded');
      const response: SPHttpClientResponse = await this.client.get(url.href, SPHttpClient.configurations.v1, {
        headers: { Accept: 'application/json;odata=nometadata' }
      });
      if (!response.ok) throw new Error('SharePoint list ' + name + ': HTTP ' + response.status);
      const body = await response.json() as ListResponse<T>;
      if (!Array.isArray(body.value)) throw new Error('Unexpected SharePoint list response: ' + name);
      values.push(...body.value);
      next = body['@odata.nextLink'] || body['odata.nextLink'];
    }
    return values.slice(0, limit);
  }

  public stations(n: number): Promise<Station[]> {
    return this.list<Station>('FirehouseStations', 'StationNumber eq ' + n + ' and IsEnabled eq 1');
  }
  public announcements(n: number): Promise<Announcement[]> {
    return this.list<Announcement>('FirehouseAnnouncements', 'StationNumber eq ' + n + ' and IsActive eq 1');
  }
  public incidents(n: number): Promise<Incident[]> {
    // Read recent incidents first rather than transferring all historical entries to every TV.
    return this.list<Incident>('FirehouseIncidents', 'StationNumber eq ' + n, 'DispatchedAt desc', 100);
  }
  public playlist(n: number): Promise<PlaylistItem[]> {
    return this.list<PlaylistItem>('FirehousePlaylist', 'StationNumber eq ' + n + ' and IsEnabled eq 1', 'SortOrder asc');
  }
}
