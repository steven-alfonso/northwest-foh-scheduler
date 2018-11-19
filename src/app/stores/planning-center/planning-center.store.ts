import { Injectable } from '@angular/core';
import { Config } from '@models/config.model';
import { IEMPacks } from '@models/iem-pack.model';
import { Member } from '@models/member.model';
import { Microphone, Microphones } from '@models/microphone.model';
import { PersonalMonitor } from '@models/personal-monitor.model';
import { Song, SongSet, SongSetType } from '@models/song-set.model';
import { WeekendExperience } from '@models/weekend-experience.model';
import { ConfigService } from '@services/config.service';
import { PlanningCenterService } from '@services/planning-center.service';
import { mergeDeep } from '@utils/merge-deep';
import { plainToClass } from 'class-transformer';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import orderBy from 'lodash/orderBy';
import moment from 'moment/moment';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { finalize, map, switchMap, take } from 'rxjs/operators';

@Injectable()
export class PlanningCenterStore {
  private _currentArrangements: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private _creatingHelpers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _microphones: BehaviorSubject<Microphone[]> = new BehaviorSubject<Microphone[]>([]);
  private _weekendExperiences: BehaviorSubject<WeekendExperience[]> = new BehaviorSubject<
    WeekendExperience[]
  >([]);

  public readonly weekendExperiences$ = this._weekendExperiences.asObservable().pipe(
    map(w => {
      console.log(w);
      return w;
    })
  );

  public readonly currentArrangements$ = this._currentArrangements.asObservable();
  // .pipe(
  //   map(currentArrangements => {
  //     return currentArrangements.map(arrangement => {
  //       return {
  //         ...arrangement,
  //         possiblePositions: (arrangements => {
  //           let possiblePositions = arrangements.map(ar => {
  //             return ar.attributes.team_position_name;
  //           });
  //           return uniq(possiblePositions).sort();
  //         })(arrangement.arrangements),
  //       };
  //     });
  //   }),
  //   map(currentArrangements => {
  //     return currentArrangements.map(arrangement => {
  //       return {
  //         ...arrangement,
  //         person: arrangement.members.map(member => {
  //           return plainToClass(Member, {
  //             id: member.relationships.person.data.id,
  //             name: member.attributes.name,
  //             teamPositionName: member.attributes.team_position_name,
  //             needsHeadphones: true,
  //           });
  //         }),
  //       };
  //     });
  //   }),
  //   map(currentArrangements => {
  //     return currentArrangements;
  //   })
  // );
  public readonly creatingHelpers$ = this._creatingHelpers.asObservable();

  public readonly microphones$ = this.configService.config$.pipe(
    map((config: Config) => {
      return config.microphones.map(mic => {
        return new Microphone(mic);
      });
    })
  );

  constructor(
    private planningCenterService: PlanningCenterService,
    private configService: ConfigService
  ) {
    // this.planningCenterService.foo();
  }

  createHelper(serviceTypeId: number | string, _startDate: Date, _endDate?: Date) {
    const s = moment(_startDate).startOf('day');
    const endDate: number = _endDate
      ? moment(_endDate)
          .endOf('day')
          .unix()
      : s.endOf('day').unix();
    const startDate: number = s.unix();
    this._creatingHelpers.next(true);
    this.planningCenterService
      .getPlans(serviceTypeId)
      .pipe(
        map(p => {
          let plans = p.map(plan => {
            return plainToClass(WeekendExperience, {
              id: plan.id,
              start: new Date(plan.attributes.sort_date),
              members: [],
              personalMonitor: new PersonalMonitor(16),
              iemPacks: new IEMPacks(),
              microphones: new Microphones(),
              positions: [],
              songSets: [],
            });
          });
          // Get plans within date range
          return orderBy(
            plans.filter(plan => {
              const sortDate = moment(plan.start).unix();
              return sortDate >= startDate && sortDate <= endDate;
            }),
            plan => {
              return plan.start;
            }
          );
        }),
        take(1),
        switchMap(plans => {
          // Get team members on plans
          return forkJoin(
            plans.map(plan => {
              return this.planningCenterService.getMembersOnPlan(serviceTypeId, plan.id).pipe(
                map(members => {
                  return {
                    ...plan,
                    members: members.map(member => {
                      return new Member({
                        id: member.relationships.person.data.id,
                        name: member.attributes.name,
                        positionName: member.attributes.team_position_name,
                        needHeadphones: true,
                      });
                    }),
                  };
                })
              );
            })
          );
        }),
        switchMap(weekendExperiences => {
          return forkJoin(
            weekendExperiences.map(weekendExperience => {
              return this.planningCenterService
                .getItemsOnPlan(serviceTypeId, weekendExperience.id)
                .pipe(
                  map(items => {
                    let songSets$ = this.getSongSets(items, weekendExperience.id);
                    songSets$.subscribe(a => {
                      console.log(a);
                    });
                    return weekendExperience;
                  })
                );
            })
          );
        }),
        finalize(() => {
          this._creatingHelpers.next(false);
        })
      )
      .subscribe(wkndExp => {
        this._weekendExperiences.next(wkndExp);
        // this._currentArrangements.next(plansMembers);
      });
  }

  private getSongSets(items: any[], wkndExpId: number): Observable<SongSet[]> {
    let praiseWorhsip = true;
    // let worshipSongSet = plainToClass(SongSet, {
    //   id: 1,
    //   order: 0,
    //   type: SongSetType.Worship,
    //   songs: [],
    // });
    // let altarSongSet = plainToClass(SongSet, {
    //   id: 2,
    //   order: 1,
    //   type: SongSetType.Altar,
    //   songs: [],
    // });
    // this.updateWeekendExperience(wkndExpId, <Partial<WeekendExperience>>{
    //   songSets: [worshipSongSet, altarSongSet],
    // });
    let worshipSongs$: Observable<Song>[] = [];
    let altarSongs$: Observable<Song>[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].attributes.title.toLowerCase() === SongSetType.Altar) {
        praiseWorhsip = false;
      } else if (items[i].attributes.item_type === 'song') {
        if (praiseWorhsip) {
          worshipSongs$ = worshipSongs$.concat([
            this.planningCenterService
              .getArrangementsBySongId(items[i].relationships.song.data.id)
              .pipe(
                map(arrangements => {
                  return <Song>{
                    id: items[i].relationships.song.data.id,
                    title: items[i].attributes.title,
                    keyName: items[i].attributes.key_name,
                    sequence: items[i].attributes.sequence,
                    description: items[i].attributes.description,
                    tempo: this.getTempo(arrangements),
                    leaderIds: [],
                  };
                })
              ),
          ]);
        } else {
          altarSongs$ = altarSongs$.concat([
            this.planningCenterService
              .getArrangementsBySongId(items[i].relationships.song.data.id)
              .pipe(
                map(arrangements => {
                  return <Song>{
                    id: items[i].relationships.song.data.id,
                    title: items[i].attributes.title,
                    keyName: items[i].attributes.key_name,
                    sequence: items[i].attributes.sequence,
                    description: items[i].attributes.description,
                    tempo: this.getTempo(arrangements),
                    leaderIds: [],
                  };
                })
              ),
          ]);
        }
      }
    }
    let w = forkJoin(worshipSongs$).pipe(
      map(songs => {
        return plainToClass(SongSet, {
          id: 1,
          order: 0,
          type: SongSetType.Worship,
          songs: songs,
        });
      })
    );
    let a = forkJoin(altarSongs$).pipe(
      map(songs => {
        return plainToClass(SongSet, {
          id: 2,
          order: 1,
          type: SongSetType.Altar,
          songs: songs,
        });
      })
    );
    return forkJoin([w, a]);
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
    console.log('addSongtoSet', song);
    updateValue = <Partial<WeekendExperience>>{
      songSets: [
        ...wkndExp.songSets.slice(0, songSetIndex),
        wkndExp.songSets[songSetIndex].songs.concat([song]),
        ...wkndExp.songSets.slice(songSetId + 1),
      ],
    };

    this.updateWeekendExperience(wkndExpId, updateValue);
  }

  updateWeekendExperience(id: number, update: Partial<WeekendExperience>) {
    console.log('updateWknExp', update);
    let wkndExps = this._weekendExperiences.getValue();
    const wkndExpIndex = findIndex(wkndExps, { id: id });
    if (wkndExpIndex >= 0) {
      this._weekendExperiences.next(<WeekendExperience[]>[
        ...wkndExps.slice(0, wkndExpIndex),
        <WeekendExperience>mergeDeep(wkndExps[wkndExpIndex], update),
        ...wkndExps.slice(wkndExpIndex + 1),
      ]);
    }
  }

  microphoneSelected(micId: string, inUseBy: number, serviceId: number) {
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

  unselectMicrophone(micId: string, serviceId: number) {
    this.microphoneSelected(micId, null, serviceId);
  }
}
