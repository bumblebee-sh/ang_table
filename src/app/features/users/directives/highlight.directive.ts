import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') value: string = '';
  @Input('appHighlightTerm') term: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updateHighlight();
  }

  private updateHighlight() {
    if (!this.term) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.value);
      return;
    }
    const re = new RegExp(`(${this.escapeRegExp(this.term)})`, 'gi');
    const highlighted = this.value.replace(re, '<mark>$1</mark>');
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', highlighted);
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
