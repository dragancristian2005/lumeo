import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserData } from '../types/userData.types';
import { Auth } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { UserMetricsComponent } from './user-metrics/user-metrics.component';
import { UserPostsComponent } from './user-posts/user-posts.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [NgIf, UserMetricsComponent, UserPostsComponent],
})
export class ProfileComponent implements OnInit {
  userId: string | null = null;
  userData: UserData | undefined;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private auth: Auth,
  ) {}

  async ngOnInit() {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      this.userId = currentUser.uid;
      const snapshot = await this.firebaseService.getUser(this.userId);

      if (snapshot.exists()) {
        this.userData = snapshot.val();
      } else {
        console.warn('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
