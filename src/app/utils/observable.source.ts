import { DataSource } from '@angular/cdk/collections';
import { Observable, Subscription } from 'rxjs';

export class ObservableDataSource<T> extends DataSource<T> {
  private currentValue: T[] = null;
  private currentValueSubscription: Subscription = this.source.subscribe(current => {
    this.currentValue = current;
  });

  constructor(private source: Observable<T[]>) {
    super();
  }

  connect(): Observable<T[]> {
    return this.source;
  }

  getValue(): T[] {
    return this.currentValue;
  }

  disconnect() {}
  removeSubscription() {
    this.currentValueSubscription.unsubscribe();
  }
}
