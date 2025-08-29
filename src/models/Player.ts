type PlayerType = {
  id: string;
  name: string;
  skillLevel?: string | null;
  profilePicture?: string | null;
  supabaseId?: string | null;
  email?: string | null;
};

export default PlayerType;
