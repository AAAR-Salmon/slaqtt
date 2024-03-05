import { isValidChannelPattern } from './topic';

describe('isValidChannelPattern', () => {
  test('to include ":channel" is valid', () => {
    expect(isValidChannelPattern('virtual/slack/:channel/say')).toBe(true);
  });

  test('to end with ":channel" is valid', () => {
    expect(isValidChannelPattern('virtual/slack/:channel')).toBe(true);
  });

  test('to begin with ":channel" is valid', () => {
    expect(isValidChannelPattern(':channel/say')).toBe(true);
  });

  test('just ":channel" is valid', () => {
    expect(isValidChannelPattern(':channel')).toBe(true);
  });

  test('not to include ":channel" is invalid', () => {
    expect(isValidChannelPattern('virtual/slack/channel/say')).toBe(false);
  });
});

describe('channelPatternToRegexp', () => {
  // TODO
});

describe('channelPatternToTopic', () => {
  // TODO
});

describe('inferPayloadFormatFromTopic', () => {
  // TODO
});

describe('getChannelFromTextTopic', () => {
  // TODO
});
