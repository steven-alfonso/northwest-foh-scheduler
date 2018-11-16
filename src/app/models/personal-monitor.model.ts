export class PersonalMonitorChannel {
    channel: number;
    inUse: boolean = false;
    constructor(channel: number) {
        this.channel = channel;
    }

    setInUse(inUse: boolean) {
        this.inUse = inUse;
    }
}

export class PersonalMonitor {
    channels: PersonalMonitorChannel[] = [];

    constructor(channelCount: number) {
        for (let i = 0; i < channelCount; i++) {
            this.channels = this.channels.concat(new PersonalMonitorChannel(i + 1));
        }
    }

    setInUse(channel: number, inUse: boolean) {
        this.channels[channel - 1].inUse = inUse;
    }

}