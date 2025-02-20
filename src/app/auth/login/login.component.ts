import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string;
  password: string;

  constructor(private authService: AuthService) {
    this.email = '';
    this.password = '';
  }

  login() {
    this.authService.login(this.email, this.password);
  }
}
