import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string;
  password: string;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {
    this.email = '';
    this.password = '';
  }

  login() {
    this.errorMessage = null;
    this.authService.login(this.email, this.password).catch((error) => {
      this.errorMessage = error.message;
    });
  }
}
