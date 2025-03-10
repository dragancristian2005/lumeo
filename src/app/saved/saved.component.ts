import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { Post } from '../types/post.types';
import { NgForOf, NgIf } from '@angular/common';
import { PostCardComponent } from '../explore/post-card/post-card.component';

@Component({
  selector: 'app-saved',
  imports: [FormsModule, NgIf, NgForOf, PostCardComponent],
  templateUrl: './saved.component.html',
  styleUrl: './saved.component.scss',
})
export class SavedComponent implements OnInit {
  currentUserId: string | null = null;
  searchQuery = '';
  bookmarks: { postId: string; postValue: Post }[] = [];

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }
  db = getDatabase();

  ngOnInit() {
    const bookmarksRef = ref(this.db, `users/${this.currentUserId}/bookmarks`);
    onValue(bookmarksRef, (snapshot) => {
      if (snapshot.exists()) {
        this.bookmarks = Object.entries(snapshot.val())
          .map(([postId, postData]) => ({
            postId,
            postValue: postData as Post,
          }))
          .filter((post) => post.postValue.authorId !== this.currentUserId)
          .sort((a, b) => b.postValue.timestamp - a.postValue.timestamp);
      } else {
        this.bookmarks = [];
      }
    });
  }

  get filteredBookmarks() {
    if (!this.searchQuery.trim()) {
      return this.bookmarks;
    }
    const query = this.searchQuery.toLowerCase();
    return this.bookmarks.filter(
      (bookmark) =>
        bookmark.postValue.postTitle.toLowerCase().includes(query) ||
        bookmark.postValue.content.toLowerCase().includes(query),
    );
  }
}
