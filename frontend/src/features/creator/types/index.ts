export interface PlatformLink {
  id: string;
  creator_profile_id: string;
  platform_name: string;
  platform_url: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  profile_image_url?: string;
  header_image_url?: string;
  created_at: string;
  updated_at?: string;
  platform_links: PlatformLink[];
}

export interface CreatorProfilePublic extends CreatorProfile {
  username: string;
}

export interface CreateProfileData {
  display_name: string;
  bio?: string;
  profile_image_url?: string;
  header_image_url?: string;
}

export interface UpdateProfileData {
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  header_image_url?: string;
}

export interface CreatePlatformLinkData {
  platform_name: string;
  platform_url: string;
  display_order?: number;
}

export interface UpdatePlatformLinkData {
  platform_name?: string;
  platform_url?: string;
  display_order?: number;
}
