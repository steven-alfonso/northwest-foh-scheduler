import { IEMPack } from './iem-pack.model';
import { Microphone } from './microphone.model';
import { PersonalMonitorChannel } from './p16-channel.model';

export class Person {
    id: number;
    name: string;
    teamPositionName: string;
    needHeadphones: boolean;
    personalMonitorChannel: PersonalMonitorChannel;
    iemPack: IEMPack;
    microphone: Microphone;
}