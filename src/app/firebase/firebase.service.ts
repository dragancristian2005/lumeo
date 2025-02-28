import { Injectable } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { get } from 'firebase/database';
import { Post, PostWithId } from '../types/post.types';
import { BehaviorSubject, Observable } from 'rxjs';

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
        const posts = Object.values(snapshot.val()) as Post[];
        const filteredPosts = posts.filter(
          (post: Post) => post.authorId === userId,
        );
        this.postCount$.next(filteredPosts.length);
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

  listenForUserPosts(userId: string) {
    const postRef = ref(this.db, `posts`);

    return new Observable<Post[]>((observer) => {
      onValue(postRef, (snapshot) => {
        if (snapshot.exists()) {
          const posts: Post[] = Object.values(snapshot.val()) as Post[];
          const filteredPosts = posts.filter(
            (post: Post) => post.authorId === userId,
          );
          observer.next(filteredPosts);
        } else {
          observer.next([]);
        }
      });
    });
  }

  listenForLikedPosts(userId: string) {
    const likedPostRef = ref(this.db, `posts`);

    return new Observable<PostWithId[]>((observer) => {
      onValue(likedPostRef, (snapshot) => {
        if (snapshot.exists()) {
          const postData = snapshot.val();
          const filteredLikedPosts: PostWithId[] = [];

          Object.keys(postData).forEach((postId) => {
            const post = postData[postId];
            if (post.likes && post.likes[userId]) {
              filteredLikedPosts.push({ ...post, postId });
            }
          });

          observer.next(filteredLikedPosts);
        } else {
          observer.next([]);
        }
      });
    });
  }
}
