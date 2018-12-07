import { Injectable } from '@angular/core';
import { Config } from '@models/config.model';
import { IEMPacks } from '@models/iem-pack.model';
import { Member } from '@models/member.model';
import { Microphone, Microphones } from '@models/microphone.model';
import { PcoPlanDatum } from '@models/pco-plans.model';
import { PersonalMonitor } from '@models/personal-monitor.model';
import { Song, SongSet, SongSetType } from '@models/song-set.model';
import { WeekendExperience } from '@models/weekend-experience.model';
import { ConfigService } from '@services/config.service';
import { PlanningCenterService } from '@services/planning-center.service';
import { mergeDeep } from '@utils/merge-deep';
import { updateOffset } from '@utils/update-offset';
import to from 'await-to-js';
import { plainToClass } from 'class-transformer';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import orderBy from 'lodash/orderBy';
import uniq from 'lodash/uniq';
import moment from 'moment-timezone';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class PlanningCenterStore {
  private _currentArrangements: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private _creatingHelpers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // private _microphones: BehaviorSubject<Microphones> = new BehaviorSubject<Microphones>(null);
  private _weekendExperiences: BehaviorSubject<WeekendExperience[]> = new BehaviorSubject<WeekendExperience[]>([]);

  public readonly weekendExperiences$ = this._weekendExperiences.asObservable().pipe(
    map(w => {
      return w;
    })
  );

  public readonly currentArrangements$ = this._currentArrangements.asObservable();
  public readonly creatingHelpers$ = this._creatingHelpers.asObservable();
  public readonly microphones$ = this.configService.config$.pipe(
    map((config: Config) => {
      return config.microphones.map(mic => {
        console.log(mic);
        return new Microphone(mic);
      });
    })
  );

  constructor(private planningCenterService: PlanningCenterService, private configService: ConfigService, private db: AngularFireStore) {}

  async createHelper(serviceTypeId: number | string, _startDate: Date, _endDate?: Date) {
    const s = moment(_startDate).startOf('day');
    const endDate: number = _endDate
      ? moment(_endDate)
          .endOf('day')
          .unix()
      : s.endOf('day').unix();
    const startDate: number = s.unix();
    this._creatingHelpers.next(true);
    let err: Error = null;
    let pcoPlans: PcoPlanDatum[] = [];
    [err, pcoPlans] = await to(this.planningCenterService.getPlans(serviceTypeId));
    if (err !== null) {
      this.createHelperError(err);
      return;
    }
    let config: Config;
    [err, config] = await to(this.configService.config$.toPromise());
    if (err) {
      this.createHelperError(err);
      return;
    }
    let weekendExperiences = orderBy(
      pcoPlans
        .map(plan => {
          return plainToClass(WeekendExperience, {
            id: parseInt(plan.id, 10),
            start: updateOffset(new Date(plan.attributes.sort_date)),
            members: [],
            personalMonitor: new PersonalMonitor(16),
            iemPacks: new IEMPacks(),
            microphones: new Microphones(config.microphones),
            positions: [],
            songSets: []
          });
        })
        .filter(plan => {
          const sortDate = moment(plan.start).unix();
          return sortDate >= startDate && sortDate <= endDate;
        }),
      plan => {
        return plan.start;
      }
    );
    [err, weekendExperiences] = await to(
      Promise.all(
        weekendExperiences.map(
          async (weekendExperience: WeekendExperience): Promise<WeekendExperience> => {
            return new Promise<WeekendExperience>(async (resolve, reject) => {
              const [errInner, members] = await to(this.planningCenterService.getMembersOnPlan(serviceTypeId, weekendExperience.id));
              if (errInner !== null) {
                reject(errInner);
              } else {
                resolve(
                  plainToClass(WeekendExperience, {
                    ...weekendExperience,
                    members: members.map(member => {
                      return new Member({
                        id: member.relationships.person.data.id,
                        name: member.attributes.name,
                        positionName: member.attributes.team_position_name,
                        needHeadphones: true
                      });
                    })
                  })
                );
              }
            });
          }
        )
      )
    );

    if (err) {
      this.createHelperError(err);
      return;
    }

    [err, weekendExperiences] = await to(
      Promise.all(
        weekendExperiences.map(
          async (weekendExperience: WeekendExperience): Promise<WeekendExperience> => {
            return new Promise<WeekendExperience>(async (resolve, reject) => {
              const [errInner, items] = await to(this.planningCenterService.getItemsOnPlan(serviceTypeId, weekendExperience.id));
              if (errInner !== null) {
                reject(errInner);
              }

              let [errInner2, songSets] = await to(this.getSongSets(items, weekendExperience.id));
              if (errInner2) {
                reject(errInner2);
              }
              songSets = songSets.filter(a => a !== undefined && a !== null);
              resolve(
                plainToClass(WeekendExperience, {
                  ...weekendExperience,
                  songSets: songSets
                })
              );
            });
          }
        )
      )
    );

    if (err) {
      this.createHelperError(err);
      return;
    }
    weekendExperiences = weekendExperiences.map(
      (weekendExperience: WeekendExperience): WeekendExperience => {
        return plainToClass(WeekendExperience, {
          ...weekendExperience,
          positions: uniq(weekendExperience.members.map(member => member.positionName))
        });
      }
    );
    console.log(weekendExperiences);
    this._weekendExperiences.next(weekendExperiences);
    this._creatingHelpers.next(false);
  }

  private createHelperError(err: Error) {
    console.error(err);
    this._creatingHelpers.next(false);
  }

  private async getSongSets(items: any[], wkndExpId: number): Promise<SongSet[]> {
    let praiseWorhsip = true;
    let worshipSongs$: Observable<Song>[] = [];
    let altarSongs$: Observable<Song>[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].attributes.title.toLowerCase() === SongSetType.Altar) {
        praiseWorhsip = false;
      } else if (items[i].attributes.item_type === 'song') {
        if (praiseWorhsip) {
          worshipSongs$ = worshipSongs$.concat([
            this.planningCenterService.getArrangementsBySongId(items[i].relationships.song.data.id).pipe(
              map((arrangements: any[]) => {
                return <Song>{
                  id: items[i].relationships.song.data.id,
                  title: items[i].attributes.title,
                  keyName: items[i].attributes.key_name,
                  sequence: items[i].attributes.sequence,
                  description: items[i].attributes.description,
                  tempo: this.getTempo(arrangements),
                  leaderIds: []
                };
              })
            )
          ]);
        } else {
          altarSongs$ = altarSongs$.concat([
            this.planningCenterService.getArrangementsBySongId(items[i].relationships.song.data.id).pipe(
              map((arrangements: any[]) => {
                return <Song>{
                  id: items[i].relationships.song.data.id,
                  title: items[i].attributes.title,
                  keyName: items[i].attributes.key_name,
                  sequence: items[i].attributes.sequence,
                  description: items[i].attributes.description,
                  tempo: this.getTempo(arrangements),
                  leaderIds: []
                };
              })
            )
          ]);
        }
      }
    }
    const w = forkJoin(worshipSongs$)
      .pipe(
        map(songs => {
          return plainToClass(SongSet, {
            id: 1,
            order: 0,
            type: SongSetType.Worship,
            songs: songs
          });
        }),
        map(songSet => {
          return plainToClass(SongSet, {
            ...songSet,
            songs: orderBy(songSet.songs, ['sequence'])
          });
        })
      )
      .toPromise();

    const a = forkJoin(altarSongs$)
      .pipe(
        map(songs => {
          return plainToClass(SongSet, {
            id: 2,
            order: 1,
            type: SongSetType.Altar,
            songs: songs
          });
        }),
        map(songSet => {
          return plainToClass(SongSet, {
            ...songSet,
            songs: orderBy(songSet.songs, ['sequence'])
          });
        })
      )
      .toPromise();
    return forkJoin([w, a])
      .pipe(
        map(songSets => {
          return orderBy(songSets, 'order');
        })
      )
      .toPromise();
  }

  private getTempo(arrangements: any[]): number {
    for (let i = 0; i < arrangements.length; i++) {
      if (arrangements[i].attributes.bpm) {
        return arrangements[i].attributes.bpm;
      }
    }
    return null;
  }

  private addSongToSet(songSetId: number, song: Song, wkndExpId: number) {
    const wkndExp = find(this._weekendExperiences.getValue(), { id: wkndExpId });
    if (!wkndExp) {
      return;
    }
    let updateValue: Partial<WeekendExperience>;
    const songSetIndex = findIndex(wkndExp.songSets, { id: songSetId });
    if (songSetIndex === -1) {
      return;
    }
    updateValue = <Partial<WeekendExperience>>{
      songSets: [
        ...wkndExp.songSets.slice(0, songSetIndex),
        wkndExp.songSets[songSetIndex].songs.concat([song]),
        ...wkndExp.songSets.slice(songSetId + 1)
      ]
    };

    this.updateWeekendExperience(wkndExpId, updateValue);
  }

  updateWeekendExperience(id: number, update: Partial<WeekendExperience>) {
    const wkndExps = this._weekendExperiences.getValue();
    const wkndExpIndex = findIndex(wkndExps, { id: id });
    if (wkndExpIndex >= 0) {
      this._weekendExperiences.next(<WeekendExperience[]>[
        ...wkndExps.slice(0, wkndExpIndex),
        <WeekendExperience>mergeDeep(wkndExps[wkndExpIndex], update),
        ...wkndExps.slice(wkndExpIndex + 1)
      ]);
    }
  }

  microphoneSelected(micId: string, inUseById: number, wkndExpId: number) {
    const wkndExps = this._weekendExperiences.getValue();
    console.log(wkndExps);
    const wkndExpIndex = findIndex(wkndExps, { id: wkndExpId });
    console.log('wknEpxIndex:', wkndExpIndex);
    if (wkndExpIndex === -1) {
      return;
    }
    let mics: Microphone[] = wkndExps[wkndExpIndex].microphones.microphones;
    const micIndex = findIndex(mics, { name: micId });
    console.log('micIndex', micIndex);
    if (micIndex === -1) {
      return;
    }
    mics = [...mics.slice(0, micIndex), <Microphone>mergeDeep(mics[micIndex], { inUseBy: inUseById }), ...mics.slice(micIndex + 1)];
    this._weekendExperiences.next(<WeekendExperience[]>[
      ...wkndExps.slice(0, wkndExpIndex),
      <WeekendExperience>mergeDeep(wkndExps[wkndExpIndex], { microphones: { microphones: mics } }),
      ...wkndExps.slice(wkndExpIndex + 1)
    ]);
    console.log(this._weekendExperiences.getValue());
  }

  unselectMicrophone(micId: string, serviceId: number) {
    this.microphoneSelected(micId, null, serviceId);
  }
}
