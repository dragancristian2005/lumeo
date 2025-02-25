import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { get, getDatabase, push, ref, set } from 'firebase/database';
import { remove } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private currentUserId: string | null = null;

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  db = getDatabase();
  async toggleBookmark(
    postId: string,
    authorUsername: string,
    title: string,
    content: string,
  ) {
    if (!this.currentUserId) return;

    const userBookmarkRef = ref(
      this.db,
      `users/${this.currentUserId}/bookmarks/${postId}`,
    );
    const savedPost = {
      postId,
      authorUsername,
      postTitle: title,
      content,
      timestamp: Date.now(),
    };
    try {
      const snapshot = await get(userBookmarkRef);
      if (snapshot.exists()) {
        await remove(userBookmarkRef);
      } else {
        await set(userBookmarkRef, savedPost);
      }
      return !snapshot.exists();
    } catch (error) {
      console.error('Bookmark error:', error);
      throw error;
    }
  }

  async isBookmarked(postId: string): Promise<boolean> {
    if (!this.currentUserId) return false;

    const bookmarkRef = ref(
      this.db,
      `users/${this.currentUserId}/bookmarks/${postId}`,
    );
    try {
      const snapshot = await get(bookmarkRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Bookmark check error:', error);
      return false;
    }
  }
}
