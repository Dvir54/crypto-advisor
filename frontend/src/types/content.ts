export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
}

export interface CoinPricesResponse {
  success: boolean;
  data: CoinPrice[];
}

export interface NewsVotes {
  positive?: number;
  negative?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  kind: string;
  currencies: string[];
  votes?: NewsVotes;
  domain?: string;
}

export interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  source: string;
}

export interface AIInsight {
  insight: string;
  source: string;
  model: string;
  crypto_assets: string[];
  investor_type?: string;
}

export interface InsightResponse {
  success: boolean;
  data: AIInsight;
}

export interface Meme {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  tags: string[];
  category: string;
}

export interface MemeResponse {
  success: boolean;
  data: Meme;
}

