import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
templateUrl: './app.component.html',
styleUrls: ['./app.component.css']

})
export class App {
  protected readonly title = signal('Сургалтын Вэбсайт');
}
