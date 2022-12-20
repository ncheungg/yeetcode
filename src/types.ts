export enum PopupState {
  NotLeetcode = 'not-on-leetcode',
  NotInRoom = 'not-in-room',
  InRoom = 'in-room',
}

export enum MessageType {
  TabChange = 'tab_change',
}

export interface PopupMessage {
  type: MessageType;
  data: any;
}

export enum SocketMessageType {
  Create = 'create',
  Join = 'join',
  Leave = 'leave',
  Message = 'message',
  Action = 'action',
}

export interface SocketMessageParams {
  roomID?: string;
  message?: string | UserInfo;
}

export interface SocketMessage {
  type: SocketMessageType;
  params: SocketMessageParams;
}

export interface UserInfo {
  userID: string;
}
