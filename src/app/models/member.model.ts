import { IEMPack } from './iem-pack.model';
import { Microphone } from './microphone.model';
import { PersonalMonitorChannel } from './personal-monitor.model';

export class Member {
  id: number;
  name: string;
  positionName: string;
  needHeadphones: boolean;
  // personalMonitorChannel: PersonalMonitorChannel;
  // iemPack: IEMPack;
  // microphone: Microphone;

  constructor(_p: Member) {
    Object.assign(this, _p);
  }
}
