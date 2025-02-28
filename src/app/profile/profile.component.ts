import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserData } from '../types/userData.types';
import { Auth } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { UserMetricsComponent } from './user-metrics/user-metrics.component';
import { UserPostsComponent } from './user-posts/user-posts.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [NgIf, UserMetricsComponent, UserPostsComponent, FormsModule],
})
export class ProfileComponent implements OnInit {
  userId: string | null = null;
  userData: UserData | undefined;
  isLoading = true;

  isEditing = false;
  newBio = '';

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

  toggleEdit() {
    if (!this.userData) return;
    this.isEditing = true;
    this.newBio = this.userData.bio || '';
    setTimeout(() => {
      const inputElement =
        document.querySelector<HTMLInputElement>('#bioInput');
      if (inputElement) inputElement.focus();
    }, 0);
  }

  async saveBio() {
    if (!this.userId || !this.userData) return;

    this.userData.bio = this.newBio.trim();
    this.isEditing = false;

    try {
      await this.firebaseService.updateUser(this.userId, { bio: this.newBio });
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  }

  logout() {
    this.authService.logout();
  }
}
