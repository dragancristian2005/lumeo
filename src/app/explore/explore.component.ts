import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, onValue, set, get, push } from 'firebase/database';
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
  postsSearchResults: Post[] = [];
  currentUserId: string | null = null;
  isUserFollowing: Record<string, boolean> = {};

  db = getDatabase();
  usersRef = ref(this.db, 'users');
  postsRef = ref(this.db, 'posts');

  /// make a topicRef and display all topics that contain the search query in the name of the topic
  /// after that display all posts that contain the topic in the popular posts section

  ngOnInit() {
    this.fetchFollowData();
  }

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;

        onValue(this.postsRef, (snapshot) => {
          if (snapshot.exists()) {
            const allPosts = Object.values(snapshot.val()) as Post[];
            this.postsSearchResults = allPosts.filter(
              (post) => post.authorId !== this.currentUserId,
            );
          } else {
            this.postsSearchResults = [];
          }
        });
      }
    });

    onValue(this.usersRef, (snapshot) => {
      if (snapshot.exists()) {
        this.searchResults = Object.entries(snapshot.val()).map(
          ([userId, user]): User => ({
            userId,
            username: (user as { username: string }).username,
          }),
        );
      } else {
        this.searchResults = [];
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
      post.content.toLowerCase().includes(this.searchQuery.toLowerCase()),
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

    const currentUserRef = ref(this.db, `users/${this.currentUserId}`);
    const currentUserSnapshot = await get(currentUserRef);
    const currentUserData = currentUserSnapshot.val();
    const senderUsername = currentUserData
      ? currentUserData.username
      : 'Unknown';

    const notificationRef = ref(this.db, `users/${userId}/notifications`);
    const newNotificationKey = push(notificationRef);

    await set(newNotificationKey, {
      type: 'follow',
      senderUsername: senderUsername,
      read: false,
      timestamp: Date.now(),
    });
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

    console.log(`Unfollowed user: ${userId}`);
  }

  fetchFollowData() {
    if (!this.currentUserId) return;

    const followingRef = ref(this.db, `users/${this.currentUserId}/following`);

    onValue(followingRef, (snapshot) => {
      this.isUserFollowing = snapshot.val() || {};
    });
  }
}
