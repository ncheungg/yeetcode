'use strict';

export enum MessageType {
  Create,
  Join,
  Leave,
  Message,
  Hint,
  Discussion,
  Solutions,
  Submit,
  Finished,
  Failed,
  Action,
  Ready,
  Unready,
  StartGame,
  EndGame,
  Forfeit,
}

// start internal types enum at 1000 to avoid conflict with MessageType
export enum MessageTypeInternal {
  FetchUserInfo = 1000,
  FetchIsInRoomState,
}

export enum UserGameState {
  Ready,
  Unready,
  Playing,
  Spectating,
  Finished,
  Forfeited,
}

export interface MessageParams {
  roomId?: string;
  message?: string;
  problem?: Problem;
  userInfo?: UserInfo;
  isInRoom?: boolean;
}

export interface Message {
  type: MessageType | MessageTypeInternal;
  params?: MessageParams;
  ts: Date;
}

export enum ProblemDifficulty {
  Easy,
  Medium,
  Hard,
}

export interface Problem {
  url: string;
  id: number;
  difficulty: ProblemDifficulty;
  name: string;
  premium: boolean;
  topics: string[];
}

export interface Round {
  problem: Problem;
  expiryDate: Date;
  finishedOrder: WebSocket[];
  forfeited: WebSocket[];
  timeoutId: NodeJS.Timeout;
}

export interface Room {
  id: string;
  sockets: {
    [userId: string]: WebSocket;
  };
  completedProblems: Set<Problem>;
  socketGameState: {
    [userId: string]: UserGameState;
  };
  isInGame: boolean;
  round?: Round;
}

export interface Rooms {
  [id: string]: Room;
}

export interface UserToRoom {
  [id: string]: string | undefined;
}

export interface UserInfo {
  userId?: string;
  avatarUrl?: string | null;
}
