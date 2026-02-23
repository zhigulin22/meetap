export type RelationshipGoal = "friendship" | "relationship" | "networking";

export type VerificationMethod = "telegram" | "sms";

export type VerificationSession = {
  id: string;
  phone: string;
  country: string;
  method: VerificationMethod;
  code: string;
  createdAt: string;
  expiresAt: string;
};

export type User = {
  id: string;
  phone: string;
  country: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  status: "active" | "blocked";
};

export type Profile = {
  userId: string;
  name: string;
  age: number;
  country: string;
  city: string;
  university: string;
  faculty: string;
  bio: string;
  facts: [string, string, string];
  interests: string[];
  values: string[];
  goal: RelationshipGoal;
};

export type EventItem = {
  id: string;
  city: string;
  title: string;
  description: string;
  startTime: string;
  place: string;
  tags: string[];
  mediaType: "image" | "video";
  mediaUrl: string;
};

export type EventAction = "like" | "dislike" | "save" | "ignore";

export type EventInteraction = {
  userId: string;
  eventId: string;
  action: EventAction;
  createdAt: string;
};

export type MatchStatus = "active" | "blocked";

export type Match = {
  id: string;
  user1Id: string;
  user2Id: string;
  status: MatchStatus;
  createdAt: string;
};

export type Message = {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
  metadata?: {
    wasLlmSuggested?: boolean;
    promptVersion?: string;
  };
};

export type ReportBlock = {
  id: string;
  reporterId: string;
  targetUserId: string;
  type: "report" | "block";
  details?: string;
  createdAt: string;
};

export type Candidate = {
  userId: string;
  candidateUserId: string;
  score: number;
  reason: string;
};
