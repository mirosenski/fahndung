export interface ImageData {
  file_path: string;
  original_name: string;
  description: string;
}

export interface PostWithImages {
  images: ImageData[];
}

export interface JWTPayload {
  sub: string;
  email: string;
  exp: number;
  role?: string;
}

export interface AuthError {
  message: string;
  status?: number;
  name?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}
