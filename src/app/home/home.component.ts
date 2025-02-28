import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { Post } from '../types/post.types';
import { NgForOf, NgIf } from '@angular/common';
import { PostCardComponent } from '../explore/post-card/post-card.component';

@Component({
  selector: 'app-home',
  imports: [NgForOf, PostCardComponent, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  currentUserId: string | null = null;
  posts: { postId: string; postValue: Post }[] = [];
  following: Record<string, boolean> = {};
  followers: Record<string, boolean> = {};
  db = getDatabase();
  postRef = ref(this.db, 'posts');
  userRef: any;

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.userRef = ref(this.db, `users/${this.currentUserId}`);

        onValue(this.userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            this.following = userData.following || {};
            this.followers = userData.followers || {};

            this.fetchPosts();
          }
        });
      }
    });
  }

  fetchPosts() {
    onValue(this.postRef, (snapshot) => {
      if (snapshot.exists()) {
        this.posts = Object.entries(snapshot.val())
          .map(([postId, postData]) => ({
            postId,
            postValue: postData as Post,
          }))
          .filter(
            (post) =>
              this.following[post.postValue.authorId] ||
              this.followers[post.postValue.authorId],
          )
          .sort((a, b) => b.postValue.timestamp - a.postValue.timestamp);

        this.fetchProfilePicturesForPosts();
      } else {
        this.posts = [];
      }
    });
  }

  async fetchProfilePicturesForPosts() {
    for (const post of this.posts) {
      const authorId = post.postValue.authorId;

      const userRef = ref(this.db, `users/${authorId}`);
      const userSnapshot = await this.getUserSnapshot(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        post.postValue.authorProfilePic = userData.profilePic || '';
      }
    }
  }

  getUserSnapshot(userRef: any) {
    return new Promise<any>((resolve, reject) => {
      onValue(userRef, resolve, reject);
    });
  }
}
