import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from './features/header/header.component';
import { MainComponent } from './features/main/main.component';
import { FooterComponent } from './features/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, MainComponent, FooterComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
