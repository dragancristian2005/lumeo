import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;

  constructor(
    private auth: Auth,
    private router: Router,
  ) {
    this.user$ = user(this.auth);
  }

  async register(email: string, password: string) {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      await this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Registration error:', error.message);
    }
  }

  async login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password).then(
        (userCredential) => {
          console.log(userCredential);
        },
      );
      await this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Login error:', error.message);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map((user) => !!user));
  }
}
