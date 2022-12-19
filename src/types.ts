export enum PopupState {
  NotLeetcode = 'not-on-leetcode',
  NotInRoom = 'not-in-room',
  InRoom = 'in-room',
}

export enum MessageType {
  TabChange = 'tab_change',
}

export interface Message {
  type: MessageType;
  data: any;
}
