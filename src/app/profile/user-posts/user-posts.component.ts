import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Post, PostWithId } from '../../types/post.types';
import { FirebaseService } from '../../firebase/firebase.service';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { RelativeTimePipe } from '../relative-time.pipe';
import { get, getDatabase, ref } from 'firebase/database';
import { remove } from '@angular/fire/database';

@Component({
  selector: 'app-user-posts',
  imports: [NgClass, NgIf, NgForOf, RelativeTimePipe],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.scss',
})
export class UserPostsComponent implements OnInit, OnDestroy {
  activeTab = 'posts';
  userId: string | null = null;
  userPosts: Post[] = [];
  likedPosts: PostWithId[] = [];
  private userPostsSubscription: Subscription | null = null;
  private userLikedPostsSubscription: Subscription | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private auth: Auth,
  ) {}

  db = getDatabase();

  async ngOnInit() {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    this.userId = currentUser.uid;

    this.listenForUserPosts();
    this.listenForLikedPosts();
  }

  listenForUserPosts() {
    if (!this.userId) return;
    this.userPostsSubscription = this.firebaseService
      .listenForUserPosts(this.userId)
      .subscribe((posts: Post[]) => {
        this.userPosts = posts;
      });
  }

  listenForLikedPosts() {
    if (!this.userId) return;
    this.userLikedPostsSubscription = this.firebaseService
      .listenForLikedPosts(this.userId)
      .subscribe((posts: PostWithId[]) => {
        this.likedPosts = posts;
      });
  }

  removeLike(postId: string) {
    if (!this.userId) return;

    const userLikeRef = ref(this.db, `posts/${postId}/likes/${this.userId}`);
    get(userLikeRef).then((snapshot) => {
      if (snapshot.exists()) {
        remove(userLikeRef);
      }
    });
  }

  ngOnDestroy() {
    if (this.userPostsSubscription) {
      this.userPostsSubscription.unsubscribe();
    }
  }
}
