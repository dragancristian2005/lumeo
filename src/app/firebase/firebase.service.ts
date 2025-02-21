import { Injectable } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { get } from 'firebase/database';
import { Post } from '../types/post.types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  postCount$ = new BehaviorSubject<number>(0);
  followersCount$ = new BehaviorSubject<number>(0);
  followingCount$ = new BehaviorSubject<number>(0);

  constructor(private db: Database) {}

  getUser(userId: string) {
    return get(ref(this.db, `users/${userId}`));
  }

  listenForPostCount(userId: string) {
    const postRef = ref(this.db, `posts`);

    onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const posts = Object.values(
          snapshot.val().filter((post: Post) => post.authorId === userId),
        );
        this.postCount$.next(posts.length);
      } else {
        this.postCount$.next(0);
      }
    });
  }

  listenForFollowersCount(userId: string) {
    const followersRef = ref(this.db, `users/${userId}/followers`);

    onValue(followersRef, (snapshot) => {
      this.followersCount$.next(
        snapshot.exists() ? Object.keys(snapshot.val()).length : 0,
      );
    });
  }

  listenForFollowingCount(userId: string) {
    const followingRef = ref(this.db, `users/${userId}/following`);

    onValue(followingRef, (snapshot) => {
      this.followingCount$.next(
        snapshot.exists() ? Object.keys(snapshot.val()).length : 0,
      );
    });
  }

  async getUserPosts(userId: string) {
    const postRef = ref(this.db, `posts`);
    const snapshot = await get(postRef);

    if (!snapshot.exists()) return [];

    const allPosts: Post = snapshot.val();
    return Object.values(allPosts).filter(
      (post: Post) => post.authorId === userId,
    );
  }

  async getLikedPosts(userId: string) {
    const likedRef = ref(this.db, `posts`);
    const snapshot = await get(likedRef);

    if (!snapshot.exists()) return [];

    const likedPosts: Post = snapshot.val();
    return Object.values(likedPosts).filter(
      (post: Post) => post.likes && post.likes[userId],
    );
  }
}
