import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;

  constructor(private authService: AuthService) {
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  register() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    } else {
      this.authService.register(
        this.firstName,
        this.lastName,
        this.username,
        this.email,
        this.password,
      );
    }
  }
}
