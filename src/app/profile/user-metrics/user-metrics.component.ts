import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../firebase/firebase.service';
import { Auth } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-metrics',
  imports: [NgIf],
  templateUrl: './user-metrics.component.html',
  styleUrl: './user-metrics.component.scss',
})
export class UserMetricsComponent implements OnInit, OnDestroy {
  userId: string | null = null;
  isLoading = true;
  postCount = 0;
  followersCount = 0;
  followingCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private auth: Auth,
  ) {}

  async ngOnInit() {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }
      this.userId = currentUser.uid;
      this.firebaseService.listenForPostCount(this.userId);
      this.firebaseService.listenForFollowersCount(this.userId);
      this.firebaseService.listenForFollowingCount(this.userId);

      this.subscriptions.push(
        this.firebaseService.postCount$.subscribe(
          (count) => (this.postCount = count),
        ),
        this.firebaseService.followersCount$.subscribe(
          (count) => (this.followersCount = count),
        ),
        this.firebaseService.followingCount$.subscribe(
          (count) => (this.followingCount = count),
        ),
      );
    } catch (error) {
      console.error('Error fetching user metrics:', error);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
