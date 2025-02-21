import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, push, set } from 'firebase/database';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    MatIconModule,
    RouterLinkActive,
    NgIf,
    NgClass,
    FormsModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  postContent = '';
  isModalOpen = false;

  constructor(
    private router: Router,
    private auth: Auth,
  ) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  db = getDatabase();
  async onSubmit() {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      const userId = currentUser.uid;
      const timestamp = Date.now();

      const post = {
        authorId: userId,
        content: this.postContent,
        timestamp,
        likes: {},
        comments: {},
      };

      const newPostRef = ref(this.db, `posts`);
      await set(push(newPostRef), post);

      this.closeModal();
      this.postContent = '';
    } catch (e) {
      console.error('Error sending data to database:', e);
    }
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
