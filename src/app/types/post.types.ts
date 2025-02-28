interface Comment {
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Post {
  authorId: string;
  authorUsername: string;
  authorProfilePic: string;
  postTitle: string;
  content: string;
  topics: string[];
  timestamp: number;
  image?: string;
  likes: Record<string, boolean>;
  comments: Record<string, Comment>;
}

export interface PostWithId extends Post {
  postId: string;
}
