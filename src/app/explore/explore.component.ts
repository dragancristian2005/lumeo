import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { NgForOf, NgIf } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { TrendingTopicsComponent } from './trending-topics/trending-topics.component';
import { Post } from '../types/post.types';
import { PostCardComponent } from './post-card/post-card.component';

interface User {
  userId: string;
  username: string;
}

@Component({
  selector: 'app-explore',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    TrendingTopicsComponent,
    PostCardComponent,
  ],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss',
})
export class ExploreComponent implements OnInit {
  searchQuery = '';
  searchResults: User[] = [];
  postsSearchResults: { postId: string; postValue: Post }[] = [];
  currentUserId: string | null = null;
  isUserFollowing: Record<string, boolean> = {};

  db = getDatabase();
  usersRef = ref(this.db, 'users');
  postsRef = ref(this.db, 'posts');

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.fetchFollowData();
        this.fetchPosts();
        this.fetchUsers();
      }
    });
  }

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  fetchUsers() {
    get(this.usersRef).then((snapshot) => {
      if (snapshot.exists()) {
        this.searchResults = Object.entries(snapshot.val()).map(
          ([userId, user]) => ({
            userId,
            username: (user as { username: string }).username,
          }),
        );
        console.log(this.searchResults);
      } else {
        this.searchResults = [];
      }
    });
  }

  fetchPosts() {
    get(this.postsRef).then((snapshot) => {
      if (snapshot.exists()) {
        this.postsSearchResults = Object.entries(snapshot.val())
          .map(([postId, postData]) => ({
            postId,
            postValue: postData as Post,
          }))
          .filter((post) => post.postValue.authorId !== this.currentUserId)
          .sort((a, b) => b.postValue.timestamp - a.postValue.timestamp);
      } else {
        this.postsSearchResults = [];
      }
    });
  }

  get filteredSearchResults() {
    return this.searchResults.filter(
      (user) =>
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        user.userId !== this.currentUserId,
    );
  }
  get filteredPostsSearchResults() {
    return this.postsSearchResults.filter((post) =>
      post.postValue.content
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase()),
    );
  }

  async followUser(userId: string) {
    if (!this.currentUserId || this.currentUserId === userId) return;

    const followingRef = ref(
      this.db,
      `users/${this.currentUserId}/following/${userId}`,
    );
    const followersRef = ref(
      this.db,
      `users/${userId}/followers/${this.currentUserId}`,
    );

    await set(followingRef, true);
    await set(followersRef, true);

    this.isUserFollowing[userId] = true;
  }

  async unfollowUser(userId: string) {
    if (!this.currentUserId || this.currentUserId === userId) return;

    const followingRef = ref(
      this.db,
      `users/${this.currentUserId}/following/${userId}`,
    );
    const followersRef = ref(
      this.db,
      `users/${userId}/followers/${this.currentUserId}`,
    );

    await set(followingRef, null);
    await set(followersRef, null);

    this.isUserFollowing[userId] = false;
  }

  fetchFollowData() {
    if (!this.currentUserId) return;

    const followingRef = ref(this.db, `users/${this.currentUserId}/following`);

    onValue(followingRef, (snapshot) => {
      this.isUserFollowing = snapshot.val() || {};
    });
  }
}
