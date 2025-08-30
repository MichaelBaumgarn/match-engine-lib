type PlayerType = {
  id: string;
  name: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  profilePicture?: string | null;
  supabaseId: string;
  email: string;
};

export default PlayerType;
