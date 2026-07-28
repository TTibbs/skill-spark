export type ChildProfile = {
  id: number;
  user_id: number;
  name: string;
  age: number;
  xp: number;
  level: number;
  reward_points: number;
  last_played: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  total_learned_words?: number;
};

export type CreateChildInput = {
  name: string;
  age: number;
};

export type UpdateChildInput = Partial<CreateChildInput>;

export type ChildListResponse = {
  children: ChildProfile[];
};

export type ChildDetailResponse = {
  childProfile: ChildProfile;
};

export type CreateChildResponse = {
  newChildProfile: ChildProfile;
};

export type UpdateChildResponse = {
  updatedChildProfile: ChildProfile;
};
