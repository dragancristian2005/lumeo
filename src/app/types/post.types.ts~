interface Comment {
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Post {
  authorId: string;
  postTitle: string;
  content: string;
  timestamp: number;
  image?: string;
  likes: Record<string, boolean>;
  comments: Record<string, Comment>;
}
