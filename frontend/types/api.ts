// Replace/extend these contracts to match the JSON returned by your backend.
export interface ApiUser {
  id: string | number;
  name: string;
  email: string;
  role: "student" | "placement" | "recruiter";
}

export interface ApiJob {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  package?: string;
  requiredSkills: string[];
  status: "active" | "closed";
}

export interface ApiStudent {
  id: string | number;
  name: string;
  email: string;
  branch?: string;
  cgpa?: number;
  skills: string[];
}

export interface ApiPlacementDrive {
  id: string | number;
  company: string;
  role: string;
  date: string;
  status: string;
}
