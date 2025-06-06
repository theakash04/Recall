export type user = {
  full_name: string;
  avatar_url: string;
  email: string;
  email_verified: true;
};

export type ServerError = {
  message: string;
};

// testimonials
export type testimonials = {
  user: {
    avatar_url: string;
    name: string;
  };
  id: string;
  createdAt: Date;
  userId: string;
  rating: number;
  feedback: string | null;
};
