import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { NgForOf, NgIf } from '@angular/common';
import { CamelCasePipe } from './camel-case.pipe';

interface Post {
  authorId: string;
  authorUsername: string;
  content: string;
  postTitle: string;
  timestamp: number;
  topics: string[];
}

@Component({
  selector: 'app-trending-topics',
  templateUrl: './trending-topics.component.html',
  styleUrl: './trending-topics.component.scss',
  imports: [NgForOf, NgIf, CamelCasePipe],
})
export class TrendingTopicsComponent implements OnInit {
  userId = '';
  followedUsersIds: string[] = [];
  topicCounts: Record<string, number> = {};
  topTopics: { topic: string; count: number }[] = [];
  popularPosts: Post[] = [];
  selectedTopic = '';
  filteredPosts: Post[] = [];

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
              this.popularPosts = postArray.filter(
                (post) => post.authorId !== this.userId,
              );

              this.topicCounts = {};
              this.popularPosts.forEach((post: Post) => {
                post.topics.forEach((topic) => {
                  this.topicCounts[topic] = (this.topicCounts[topic] || 0) + 1;
                });
              });

              this.topTopics = Object.entries(this.topicCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([topic, count]) => ({ topic, count }));

              this.filterPostsByTopic('');
            }
          });
        }
      }
    });
  }

  selectTopic(topic: string) {
    this.selectedTopic = topic;
    this.filterPostsByTopic(topic);
  }

  filterPostsByTopic(topic: string) {
    if (topic === '') {
      this.filteredPosts = this.popularPosts;
    } else {
      this.filteredPosts = this.popularPosts.filter((post) =>
        post.topics.includes(topic),
      );
    }
  }

  clearSelectedTopic() {
    this.selectedTopic = '';
    this.filterPostsByTopic('');
  }
}
