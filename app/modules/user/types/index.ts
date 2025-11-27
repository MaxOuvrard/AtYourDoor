export type Role = 'ADMIN' | 'USER' | 'OWNER';

export type User = {
    name: string;
    username?: string;
    email: string;
    role: Role;
    id: number;
};

// Generic list response for resources that return arrays
export type ListResponse<T> = T[];

// Extract only name and email from a list response of users (keeps this generic)
export type ExtractData<T> = T extends Array<infer U>
  ? Pick<U & { name: string; email: string }, 'name' | 'email'>[]
  : never;

// Partial update type for a user (do not allow changing id)
export type UserUpdate = Partial<Omit<User, 'id'>>;


