import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { NgForOf, NgIf } from '@angular/common';

interface Post {
  authorId: string;
  content: string;
  postTitle: string;
  timestamp: number;
  topics: string[];
}

@Component({
  selector: 'app-trending-topics',
  templateUrl: './trending-topics.component.html',
  styleUrl: './trending-topics.component.scss',
  imports: [NgForOf, NgIf],
})
export class TrendingTopicsComponent implements OnInit {
  userId = '';
  followedUsersIds: string[] = [];
  topicCounts: Record<string, number> = {};
  topTopics: { topic: string; count: number }[] = [];

  constructor(private auth: Auth) {}

  db = getDatabase();

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid;
        const userFollowingRef = ref(this.db, `users/${this.userId}/following`);
        onValue(userFollowingRef, (snapshot) => {
          const following = snapshot.val();
          this.followedUsersIds = following ? Object.keys(following) : [];
        });
        if (this.followedUsersIds.length > 0) {
          const postsRef = ref(this.db, 'posts');
          onValue(postsRef, (snapshot) => {
            const posts = snapshot.val();
            if (posts) {
              const postArray = Object.values(posts) as Post[];

              this.topicCounts = {};

              postArray.forEach((post: Post) => {
                post.topics.forEach((topic) => {
                  this.topicCounts[topic] = (this.topicCounts[topic] || 0) + 1;
                });
              });

              this.topTopics = Object.entries(this.topicCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([topic, count]) => ({ topic, count }));
            }
          });
        }
      }
    });
  }
}
