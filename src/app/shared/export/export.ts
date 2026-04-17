import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService, ExportFormat } from '../../core/services/export.service';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export.html',
  styleUrl: './export.scss'
})
export class ExportComponent {

  @Input() data: Record<string, unknown>[] = [];
  @Input() filename: string = 'export';

  ouvert = false;
  confirmation: { format: ExportFormat; label: string } | null = null;

  formats: { value: ExportFormat; label: string }[] = [
    { value: 'csv', label: 'CSV' },
    { value: 'xml', label: 'XML' },
  ];

  constructor(
    private exportService: ExportService,
    private elRef: ElementRef
  ) {}

  toggleMenu(): void {
    this.ouvert = !this.ouvert;
  }

  demanderConfirmation(format: ExportFormat, label: string): void {
    this.ouvert = false;
    this.confirmation = { format, label };
  }

  confirmerExport(): void {
    if (!this.confirmation) return;
    this.exportService.export(this.data, this.filename, this.confirmation.format);
    this.confirmation = null;
  }

  annulerExport(): void {
    this.confirmation = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.ouvert = false;
    }
  }
}
