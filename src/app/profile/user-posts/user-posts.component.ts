import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Post } from '../../types/post.types';
import { FirebaseService } from '../../firebase/firebase.service';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-posts',
  imports: [NgClass, NgIf, NgForOf],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.scss',
})
export class UserPostsComponent implements OnInit, OnDestroy {
  activeTab = 'posts';
  userId: string | null = null;
  userPosts: Post[] = [];
  likedPosts: Post[] = [];
  private userPostsSubscription: Subscription | null = null;
  private userLikedPostsSubscription: Subscription | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private auth: Auth,
  ) {}

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
      .subscribe((posts: Post[]) => {
        this.likedPosts = posts;
      });
  }

  ngOnDestroy() {
    if (this.userPostsSubscription) {
      this.userPostsSubscription.unsubscribe();
    }
  }
}
