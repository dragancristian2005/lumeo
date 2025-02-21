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
import { Database, ref, set } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;

  constructor(
    private auth: Auth,
    private router: Router,
    private db: Database,
  ) {
    this.user$ = user(this.auth);
  }

  async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
  ) {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      const userId = userCredentials.user.uid;
      await set(ref(this.db, `users/${userId}`), {
        firstName,
        lastName,
        username,
        email,
        profilePic: '',
        bio: '',
        followers: {},
        following: {},
      });
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
