export interface APIResponse {
  chunk: Chunk;
  highlights: string[];
  score: number;
}

export interface Chunk {
  id: string;
  link: string;
  created_at: string;
  updated_at: string;
  chunk_html: string;
  metadata: Metadata;
  tracking_id: string;
  time_stamp: string;
  dataset_id: string;
  weight: number;
  location: any;
  image_urls: string[];
  tag_set: string[];
  num_value: any;
}

export interface Metadata {
  about_the_game: string;
  achievements: number;
  average_playtime_2weeks: number;
  average_playtime_forever: number;
  categories: string[];
  detailed_description: string;
  developers: string[];
  dlc_count: number;
  estimated_owners: string;
  full_audio_languages: string[];
  genres: string[];
  header_image: string;
  linux: boolean;
  mac: boolean;
  median_playtime_2weeks: number;
  median_playtime_forever: number;
  metacritic_score: number;
  metacritic_url: string;
  movies: string[];
  name: string;
  negative: number;
  notes: string;
  packages: Package[];
  peak_ccu: number;
  positive: number;
  price: number;
  publishers: string[];
  recommendations: number;
  release_date: string;
  required_age: number;
  reviews: string;
  score_rank: string;
  screenshots: string[];
  short_description: string;
  support_email: string;
  support_url: string;
  supported_languages: string[];
  tags: { [tag: string]: number };
  user_score: number;
  website: string;
  windows: boolean;
}

export interface Package {
  description: string;
  subs: Sub[];
  title: string;
}

export interface Sub {
  description: string;
  price: number;
  text: string;
}
