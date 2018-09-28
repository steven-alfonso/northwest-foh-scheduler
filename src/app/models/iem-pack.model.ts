export class IEMPack {
    name: string;
    inUse: boolean = false;

    constructor(name: string, inUse: boolean = false) {
        this.name = name;
        this.inUse = inUse
    }
}

export class IEMPacks {
    packs: IEMPack[]

    constructor() {
        this.packs = [];
    }
}