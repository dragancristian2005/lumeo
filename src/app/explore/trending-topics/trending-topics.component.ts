import { Component, OnInit } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { NgForOf, NgIf } from '@angular/common';
import { CamelCasePipe } from './camel-case.pipe';
import { PostCardComponent } from '../post-card/post-card.component';
import { Post } from '../../types/post.types';

@Component({
  selector: 'app-trending-topics',
  templateUrl: './trending-topics.component.html',
  styleUrl: './trending-topics.component.scss',
  imports: [NgForOf, NgIf, CamelCasePipe, PostCardComponent],
})
export class TrendingTopicsComponent implements OnInit {
  currentUserId: string | null = null;
  followedUsersIds: string[] = [];
  topicCounts: Record<string, number> = {};
  topTopics: { topic: string; count: number }[] = [];
  popularPosts: { postId: string; postValue: Post }[] = [];
  selectedTopic = '';
  filteredPosts: { postId: string; postValue: Post }[] = [];

  db = getDatabase();

  constructor(private auth: Auth) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.currentUserId = user.uid;
        this.fetchFollowing();
      }
    });
  }

  fetchFollowing() {
    if (!this.currentUserId) return;

    const userFollowingRef = ref(
      this.db,
      `users/${this.currentUserId}/following`,
    );
    onValue(userFollowingRef, (snapshot) => {
      const following = snapshot.val();
      this.followedUsersIds = following ? Object.keys(following) : [];
      this.fetchPosts();
    });
  }

  fetchPosts() {
    if (!this.followedUsersIds.length) return;

    const postsRef = ref(this.db, 'posts');
    onValue(postsRef, (snapshot) => {
      const posts = snapshot.val();
      if (!posts) return;

      this.popularPosts = Object.entries(posts)
        .map(([postId, postData]) => ({
          postId,
          postValue: postData as Post,
        }))
        .filter((post) => post.postValue.authorId !== this.currentUserId)
        .sort((a, b) => b.postValue.timestamp - a.postValue.timestamp);

      this.calculateTopTopics();
      this.filterPostsByTopic('');
    });
  }

  calculateTopTopics() {
    this.topicCounts = {};
    this.popularPosts.forEach((post) => {
      post.postValue.topics.forEach((topic) => {
        this.topicCounts[topic] = (this.topicCounts[topic] || 0) + 1;
      });
    });

    this.topTopics = Object.entries(this.topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));
  }

  selectTopic(topic: string) {
    this.selectedTopic = topic;
    this.filterPostsByTopic(topic);
  }

  filterPostsByTopic(topic: string) {
    this.filteredPosts = topic
      ? this.popularPosts.filter((post) =>
          post.postValue.topics.includes(topic),
        )
      : [...this.popularPosts];
  }

  clearSelectedTopic() {
    this.selectedTopic = '';
    this.filterPostsByTopic('');
  }
}
