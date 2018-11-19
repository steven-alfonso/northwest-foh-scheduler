import { IEMPacks } from './iem-pack.model';
import { Microphones } from './microphone.model';
import { Member } from './member.model';
import { PersonalMonitor } from './personal-monitor.model';
import { SongSet } from './song-set.model';

export class WeekendExperience {
  id: number;
  start: Date;
  members: Member[];
  personalMonitor: PersonalMonitor;
  iemPacks: IEMPacks;
  microphones: Microphones;
  positions: string[];
  songSets: SongSet[];
  items: any[];
}
