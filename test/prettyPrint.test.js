import prettyPrint from '../src/prettyPrint';

test('When conference is over a month away - only shows months', () => {
  expect(prettyPrint(56)).toEqual("2 months");
});

test('When conference is over 2 month away show "2 months"', () => {
  expect(prettyPrint(62)).toEqual("2 months");
});

test('When there is exactly one day left show "1 day"', () => {
  expect(prettyPrint(1)).toEqual("1 day");
});

test('When there is less than 1 month left - show days', () => {
  expect(prettyPrint(2)).toEqual("2 days");
});
