import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserData } from '../types/userData.types';
import { Auth } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { UserMetricsComponent } from './user-metrics/user-metrics.component';
import { UserPostsComponent } from './user-posts/user-posts.component';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';

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

  @ViewChild('fileInput') fileInput!: ElementRef;

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

  async uploadProfilePic(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.userId) return;

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profile-pics/${this.userId}/${uuidv4()}`,
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await this.firebaseService.updateUser(this.userId, {
        profilePic: downloadURL,
      });
      if (this.userData) {
        this.userData.profilePic = downloadURL;
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }

  toggleDarkMode() {
    const darkModeEnabled = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', darkModeEnabled ? 'dark' : 'light');
  }
}
