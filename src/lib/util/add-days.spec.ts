import { addDays } from './add-days';

describe('addDays', () => {
  it('should add the specified number of days to the given date', () => {
    const date = new Date('2022-01-01');
    const daysToAdd = 5;
    const expectedDate = new Date('2022-01-06');

    const result = addDays(date, daysToAdd);

    expect(result).toEqual(expectedDate);
  });

  it('should handle negative number of days correctly', () => {
    const date = new Date('2022-01-10');
    const daysToAdd = -3;
    const expectedDate = new Date('2022-01-07');

    const result = addDays(date, daysToAdd);

    expect(result).toEqual(expectedDate);
  });
});
