type PlayerType = {
  id: string;
  name: string;
  skillLevel: "A1" | "A2" | "A3" | "F1" | "F2" | "F3";
  profilePicture?: string | null;
  supabaseId: string;
  email: string;
  city?: string | null;
};

export default PlayerType;
