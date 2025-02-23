import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, push, set, get } from 'firebase/database';
import { Auth } from '@angular/fire/auth';
import { Post } from '../../types/post.types';

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    MatIconModule,
    RouterLinkActive,
    NgIf,
    NgClass,
    FormsModule,
    NgForOf,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  postContent = '';
  postTitle = '';
  searchQuery = '';
  isModalOpen = false;
  topics = [
    // Technology & Innovation
    'Software Development',
    'Artificial Intelligence (AI)',
    'Cybersecurity',
    'Gadgets & Hardware',
    'Web3 & Blockchain',
    'Startup Culture',
    'Programming Tutorials',
    'Tech News',
    'Open Source Projects',
    'Robotics',

    // Lifestyle & Wellness
    'Mental Health',
    'Fitness & Exercise',
    'Nutrition & Diet',
    'Mindfulness & Meditation',
    'Self-Care Routines',
    'Sustainable Living',
    'Minimalism',
    'Productivity Hacks',

    // Entertainment & Pop Culture
    'Movies & TV Shows',
    'Celebrity News',
    'Music Releases',
    'Gaming Streams',
    'Memes & Viral Content',
    'Anime & Manga',
    'Book Recommendations',
    'Fan Theories',

    // Creative Arts
    'Digital Art',
    'Photography',
    'Graphic Design',
    'DIY Crafts',
    'Writing & Poetry',
    'Music Production',
    'Filmmaking',
    'Street Art',

    // Travel & Adventure
    'Travel Tips',
    'Budget Travel',
    'Cultural Experiences',
    'Adventure Sports',
    'Solo Travel Stories',
    'Hidden Gems',
    'Food Travel',
    'Eco-Tourism',

    // Education & Career
    'Online Learning',
    'Career Advice',
    'Remote Work Tips',
    'Study Techniques',
    'Freelancing',
    'University Life',
    'Coding Bootcamps',
    'Resume Building',

    // Science & Environment
    'Climate Change',
    'Space Exploration',
    'Renewable Energy',
    'Biology & Genetics',
    'Environmental Activism',
    'Astronomy',
    'Scientific Discoveries',
    'Wildlife Conservation',

    // Sports & Fitness
    'Football/Soccer',
    'Basketball',
    'Esports',
    'Marathon Training',
    'Yoga',
    'Cycling',
    'Workout Routines',
    'Sports Analytics',

    // Food & Cooking
    'Recipe Sharing',
    'Baking Tips',
    'Vegan/Vegetarian Diets',
    'Food Photography',
    'Restaurant Reviews',
    'Meal Prep Ideas',
    'International Cuisine',
    'Coffee Culture',

    // Finance & Business
    'Personal Finance',
    'Investing & Stocks',
    'Cryptocurrency',
    'Entrepreneurship',
    'Side Hustles',
    'Real Estate',
    'Economic News',
    'Frugal Living',

    // Social & Community
    'Social Justice',
    'LGBTQ+ Topics',
    'Volunteering Opportunities',
    'Local Events',
    'Relationship Advice',
    'Parenting Tips',
    'Pet Care',
    'Activism',

    // Gaming & Esports
    'PC Gaming',
    'Console Wars',
    'Mobile Games',
    'Game Development',
    'Speedrunning',
    'Cosplay',
    'Game Reviews',
    'VR/AR Gaming',

    // Fashion & Beauty
    'Streetwear Trends',
    'Sustainable Fashion',
    'Makeup Tutorials',
    'Skincare Routines',
    'Thrift Shopping',
    'Fashion Design',
    'Body Positivity',
    'Seasonal Outfits',

    // Hobbies & Interests
    'Gardening',
    'Board Games',
    'Model Building',
    'Collectibles',
    'Astrology & Tarot',
    'Language Learning',
    'Podcast Recommendations',
    'Car Modifications',

    // Miscellaneous
    'Funny Stories',
    'Random Thoughts',
    'Q&A Sessions',
    'Challenges',
    'Throwback Posts',
    'Inspirational Quotes',
    'AMA (Ask Me Anything)',
    'Polls & Surveys',
  ];
  selectedTopics: string[] = [];

  get filteredTopics() {
    return this.topics.filter((topic) =>
      topic.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  toggleTopic(topic: string) {
    if (this.selectedTopics.includes(topic)) {
      this.selectedTopics = this.selectedTopics.filter((t) => t !== topic);
    } else {
      this.selectedTopics.push(topic);
    }
  }

  constructor(
    private router: Router,
    private auth: Auth,
  ) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  db = getDatabase();
  async onSubmit() {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      const userId = currentUser.uid;
      const usernameRef = ref(this.db, `users/${userId}/username`);
      const usernameSnapshot = await get(usernameRef);
      const username = usernameSnapshot.val();

      const timestamp = Date.now();

      const post: Post = {
        authorId: userId,
        authorUsername: username,
        postTitle: this.postTitle,
        content: this.postContent,
        topics: this.selectedTopics,
        timestamp,
        likes: {},
        comments: {},
      };

      const newPostRef = ref(this.db, `posts`);
      await set(push(newPostRef), post);

      this.closeModal();
      this.postContent = '';
      this.postTitle = '';
    } catch (e) {
      console.error('Error sending data to database:', e);
    }
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
