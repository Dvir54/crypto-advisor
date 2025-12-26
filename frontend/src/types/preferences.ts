// Preferences data types

export interface Preferences {
  id: string;
  user_id: string;
  crypto_assets: string[];
  investor_type: string;
  content_types: string[];
}

export interface PreferencesRequest {
  crypto_assets: string[];
  investor_type: string;
  content_types: string[];
}

export interface CryptoAssetOption {
  id: string;
  name: string;
  symbol: string;
}

export interface InvestorTypeOption {
  id: string;
  name: string;
  description: string;
}

export interface ContentTypeOption {
  id: string;
  name: string;
  description: string;
}

