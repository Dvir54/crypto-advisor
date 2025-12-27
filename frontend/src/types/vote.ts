export type ContentType = 'news' | 'price' | 'ai' | 'meme';

export interface VoteCreate {
  content_type: ContentType;
  content_id: string;
  is_upvote: boolean;
}

export interface Vote {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  is_upvote: boolean;
  created_at: string;
}

export interface VoteResponse {
  success: boolean;
  data: Vote;
}

export interface VotesResponse {
  success: boolean;
  data: Vote[];
}

