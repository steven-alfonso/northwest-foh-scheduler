export class Microphone {
    name: string;
    inUse: boolean = false;

    constructor(name:string) {
        this.name = name;
    }
}

export class Microphones {
    microphones: Microphone[];

    constructor() {
        this.microphones = [];
    }
}