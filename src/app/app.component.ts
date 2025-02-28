import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './app-layout/navigation/navigation.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    if (
      savedTheme === 'dark' ||
      (savedTheme !== 'light' && prefersDarkScheme)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
