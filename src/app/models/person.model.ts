import { IEMPack } from './iem-pack.model';
import { Microphone } from './microphone.model';
import { PersonalMonitorChannel } from './personal-monitor.model';

export class Person {
  id: number;
  name: string;
  teamPositionName: string;
  needHeadphones: boolean;
  personalMonitorChannel: PersonalMonitorChannel;
  iemPack: IEMPack;
  microphone: Microphone;

  constructor(_p: Person) {
    Object.assign(this, _p);
  }
}
