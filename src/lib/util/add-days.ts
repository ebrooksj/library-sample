import * as moment from 'moment';

export function addDays(date: Date, days: number): Date {
  return moment(date).add(days, 'days').toDate();
}
