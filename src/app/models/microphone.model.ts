export class Microphone {
  name: string;
  inUseBy: number = null;

  constructor(name: string) {
    this.name = name;
  }
}

export class Microphones {
  microphones: Microphone[];

  constructor(micNames: string[] = []) {
    this.microphones = micNames.map(m => new Microphone(m));
  }
}
