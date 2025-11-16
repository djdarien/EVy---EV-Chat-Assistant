
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  sources?: Source[];
}