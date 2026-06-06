import { Injectable } from '@angular/core';

export type ExportFormat = 'csv' | 'xml';

@Injectable({ providedIn: 'root' })
export class ExportService {

  export(data: Record<string, unknown>[], filename: string, format: ExportFormat): void {
    if (format === 'csv') this.exportCsv(data, filename);
    if (format === 'xml') this.exportXml(data, filename);
  }

  // CSV
  private exportCsv(data: Record<string, unknown>[], filename: string): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(';')
    );

    const content = [headers.join(';'), ...rows].join('\n');
    this.telecharger(content, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  // XML
  private exportXml(data: Record<string, unknown>[], filename: string): void {
    const items = data.map(row => {
      const fields = Object.entries(row)
        .map(([k, v]) => `    <${k}>${this.escapeXml(String(v ?? ''))}</${k}>`)
        .join('\n');
      return `  <item>\n${fields}\n  </item>`;
    }).join('\n');

    const content = `<?xml version="1.0" encoding="UTF-8"?>\n<export>\n${items}\n</export>`;
    this.telecharger(content, `${filename}.xml`, 'application/xml;charset=utf-8;');
  }

  // Téléchargement
  private telecharger(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
