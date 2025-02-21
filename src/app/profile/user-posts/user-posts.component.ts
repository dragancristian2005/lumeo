import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Post } from '../../types/post.types';
import { FirebaseService } from '../../firebase/firebase.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-user-posts',
  imports: [NgClass, NgIf, NgForOf],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.scss',
})
export class UserPostsComponent implements OnInit {
  activeTab = 'posts';
  userId: string | null = null;
  userPosts: Post[] = [];
  likedPosts: Post[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private auth: Auth,
  ) {}

  async ngOnInit() {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    this.userId = currentUser.uid;

    this.fetchUserPosts();
    this.fetchLikedPosts();
  }

  async fetchUserPosts() {
    if (!this.userId) return;
    this.userPosts = await this.firebaseService.getUserPosts(this.userId);
  }

  async fetchLikedPosts() {
    if (!this.userId) return;
    this.likedPosts = await this.firebaseService.getLikedPosts(this.userId);
  }
}
