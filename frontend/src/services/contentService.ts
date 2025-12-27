import api from './api';
import type { 
  CoinPricesResponse, 
  NewsResponse, 
  InsightResponse, 
  MemeResponse 
} from '../types/content';

/**
 * Service for fetching content data from the backend
 */

export const getCoinPrices = async (coins?: string[]): Promise<CoinPricesResponse> => {
  const params = coins && coins.length > 0 ? { coins: coins.join(',') } : {};
  const response = await api.get<CoinPricesResponse>('/content/prices', { params });
  return response.data;
};

export const getNews = async (currencies?: string[], limit: number = 10): Promise<NewsResponse> => {
  const params: any = { limit };
  if (currencies && currencies.length > 0) {
    params.currencies = currencies.join(',');
  }
  const response = await api.get<NewsResponse>('/content/news', { params });
  return response.data;
};

export const getInsight = async (): Promise<InsightResponse> => {
  const response = await api.get<InsightResponse>('/content/insight');
  return response.data;
};

export const getMeme = async (category?: string): Promise<MemeResponse> => {
  const params = category ? { category } : {};
  const response = await api.get<MemeResponse>('/content/meme', { params });
  return response.data;
};

