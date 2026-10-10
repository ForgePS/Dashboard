import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { FirehouseDashboard, DashboardProps } from './FirehouseDashboard';

export interface IFirehouseDashboardWebPartProps {
  stationNumber: string;
  refreshSeconds: number;
  takeoverMinutes: number;
}

export default class FirehouseDashboardWebPart extends BaseClientSideWebPart<IFirehouseDashboardWebPartProps> {
  public render(): void {
    const station = Number(this.properties.stationNumber || '1');
    const props: DashboardProps = {
      spHttpClient: this.context.spHttpClient,
      webUrl: this.context.pageContext.web.absoluteUrl,
      stationNumber: Number.isFinite(station) && station > 0 ? station : 1,
      refreshSeconds: this.properties.refreshSeconds || 15,
      takeoverMinutes: this.properties.takeoverMinutes || 5
    };
    ReactDom.render(React.createElement(FirehouseDashboard, props), this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: 'Station-specific Firehouse Dashboard' }, groups: [{
      groupName: 'Display Settings',
      groupFields: [
        PropertyPaneTextField('stationNumber', { label: 'Station number (e.g. 1)' }),
        PropertyPaneSlider('refreshSeconds', { label: 'List refresh (seconds)', min: 10, max: 120 }),
        PropertyPaneSlider('takeoverMinutes', { label: 'Active dispatch display (minutes)', min: 1, max: 30 })
      ]
    }] }] };
  }
}
