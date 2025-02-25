import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../../types/post.types';
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from 'firebase/database';
import { remove } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';
import { BookmarkService } from '../../services/bookmark.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelativeTimePipe } from '../../profile/relative-time.pipe';
import { Comments } from '../../types/comments.types';

@Component({
  selector: 'app-post-card',
  imports: [NgClass, FormsModule, NgForOf, NgIf, RelativeTimePipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent implements OnInit {
  @Input() postValue!: Post;
  @Input() postId!: string;
  currentUserId: string | null = null;
  likesCount = 0;
  commentsCount = 0;
  commentContent = '';
  comments: Comments[] = [];
  isBookmarked = false;

  constructor(
    private auth: Auth,
    private bookmarkService: BookmarkService,
  ) {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadBookmarkStatus();
      }
    });
  }

  async ngOnInit() {
    this.getLikesCount(this.postId);
    this.getCommentsCount(this.postId);
    this.getPostComments();
  }

  async loadBookmarkStatus() {
    this.isBookmarked = !!(await this.bookmarkService.isBookmarked(
      this.postId,
    ));
  }

  db = getDatabase();

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
    this.commentContent = '';
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
}
