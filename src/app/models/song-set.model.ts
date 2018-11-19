export class SongSet {
  id: number;
  order: number;
  type: SongSetType;
  songs: Song[];
}

export enum SongSetType {
  Worship = 'worship',
  Altar = 'altar',
}

export class Song {
  id: number;
  title: string;
  leaderIds : number[];
  tempo: number;
  keyName:string;
  sequence:any;
  description: string;
}
