import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../../types/post.types';
import { Auth } from '@angular/fire/auth';
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from 'firebase/database';
import { remove } from '@angular/fire/database';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comments } from '../../types/comments.types';
import { RelativeTimePipe } from '../../profile/relative-time.pipe';
import { BookmarkService } from '../../services/bookmark.service';

@Component({
  selector: 'app-home-post-card',
  imports: [NgIf, FormsModule, NgForOf, RelativeTimePipe, NgClass],
  templateUrl: './home-post-card.component.html',
  styleUrl: './home-post-card.component.scss',
})
export class HomePostCardComponent implements OnInit {
  @Input() postValue!: Post;
  @Input() postId!: string;
  likesCount = 0;
  commentsCount = 0;
  currentUserId: string | null = null;
  commentContent = '';
  comments: Comments[] = [];
  isBookmarked = false;

  constructor(
    private auth: Auth,
    private bookmarkService: BookmarkService,
  ) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  db = getDatabase();

  async ngOnInit() {
    this.getLikesCount(this.postId);
    this.getCommentsCount(this.postId);
    this.getPostComments();

    this.isBookmarked = !!(await this.bookmarkService.isBookmarked(
      this.postId,
    ));
  }

  toggleLike(postId: string) {
    if (!this.currentUserId) return;

    const userLikeRef = ref(
      this.db,
      `posts/${postId}/likes/${this.currentUserId}`,
    );
    get(userLikeRef).then((snapshot) => {
      if (snapshot.exists()) {
        remove(userLikeRef);
      } else {
        update(ref(this.db, `posts/${postId}/likes`), {
          [this.currentUserId!]: true,
        }).then(() => {
          this.sendNotification(this.postValue.authorId, 'like');
        });
      }
    });
  }

  addComment(postId: string) {
    if (!this.currentUserId || !this.postValue) return;

    const commentRef = ref(this.db, `posts/${postId}/comments`);
    const newComment = {
      authorId: this.currentUserId,
      authorUsername: this.postValue.authorUsername,
      content: this.commentContent,
      timestamp: Date.now(),
    };

    push(commentRef, newComment).then(() => {
      this.sendNotification(this.postValue.authorId, 'comment');
    });
  }

  getPostComments() {
    const commentsRef = ref(this.db, `posts/${this.postId}/comments`);
    onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        this.comments = Object.values(snapshot.val());
      } else {
        this.comments = [];
      }
    });
  }

  getLikesCount(postId: string) {
    const likesRef = ref(this.db, `posts/${postId}/likes`);
    onValue(likesRef, (snapshot) => {
      this.likesCount = snapshot.exists()
        ? Object.keys(snapshot.val()).length
        : 0;
    });
  }

  getCommentsCount(postId: string) {
    const commentsRef = ref(this.db, `posts/${postId}/comments`);
    onValue(commentsRef, (snapshot) => {
      this.commentsCount = snapshot.exists()
        ? Object.keys(snapshot.val()).length
        : 0;
    });
  }

  sendNotification(userId: string, type: 'like' | 'comment') {
    if (!this.currentUserId) return;

    const notificationRef = ref(this.db, `users/${userId}/notifications`);
    const newNotification = {
      senderUsername: this.postValue.authorUsername,
      timestamp: Date.now(),
      type: type,
    };

    push(notificationRef, newNotification);
  }

  async toggleBookmark() {
    if (!this.currentUserId) return;
    try {
      this.isBookmarked = !!(await this.bookmarkService.toggleBookmark(
        this.postId,
        this.postValue.authorUsername,
        this.postValue.postTitle,
        this.postValue.content,
      ));
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  }
}
