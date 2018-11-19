import { Injectable } from '@angular/core';
import { Microphone } from '@models/microphone.model';
import { PlanningCenterStore } from '@stores/planning-center/planning-center.store';
import findIndex from 'lodash/findIndex';
import { BehaviorSubject } from 'rxjs';
import { mergeDeep } from '@utils/merge-deep';

@Injectable()
export class EquipmentStore {
  private _microphones: BehaviorSubject<Microphone[]> = new BehaviorSubject<Microphone[]>([]);

  public readonly microphones$ = this._microphones.asObservable();

  constructor(private planningCenterStore: PlanningCenterStore) {}

  microphoneSelected(micId: string, inUseBy: number) {
    const mics = this._microphones.getValue();
    const index = findIndex(mics, { name: micId });
    if (index >= 0) {
      this._microphones.next(<Microphone[]>[
        ...mics.slice(0, index),
        <Microphone>mergeDeep(mics[index], { inUseBy: inUseBy }),
        ...mics.slice(index + 1),
      ]);
    }
  }

  unselectMicrophone(micId: string) {
    this.microphoneSelected(micId, null);
  }
}
