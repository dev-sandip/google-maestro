export type RoundStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED';
export type ViewState = 'LIST' | 'CREATE_ROUND' | 'EDIT_ROUND' | 'LIVE_CONTROL' | 'IMPORT_PARTICIPANTS' | 'PARTICIPANTS';
export interface UserData {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED';
  elo: number;
  lastActive: string;
}
export enum RoundStatusEnum {
  LIVE = 'LIVE',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED'
}