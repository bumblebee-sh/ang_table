import { Component, Input } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loader',
  imports: [NzSpinModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() loading: boolean = true;
  @Input() loadingText: string = 'Loading...';
  @Input() fullScreen: boolean = false;
}
