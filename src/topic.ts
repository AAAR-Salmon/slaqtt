import { PayloadFormat } from "./types/payloadFormat";


export function isValidChannelPattern(pattern: string): boolean {
  return /(^|\/):channel($|\/)/.test(pattern);
}

export async function channelPatternToRegexp(pattern: string): Promise<RegExp> {
  if (!isValidChannelPattern(pattern)) {
    throw new SyntaxError(`${pattern} is invalid channel pattern`);
  }
  return new RegExp(pattern.replace(':channel', '(?<channel>[^/]+)'));
}

export async function channelPatternToTopic(pattern: string): Promise<string> {
  if (!isValidChannelPattern(pattern)) {
    throw new SyntaxError(`${pattern} is invalid channel pattern`);
  }
  return pattern.replace(':channel', '+');
}

export async function inferPayloadFormatFromTopic(
  topic: string,
  patterns: { [key in PayloadFormat]: string },
): Promise<PayloadFormat> {
  if (topic === patterns[PayloadFormat.Json]) {
    return PayloadFormat.Json;
  }

  const re = await channelPatternToRegexp(patterns[PayloadFormat.Text]);
  if (re.test(topic)) {
    return PayloadFormat.Text;
  }

  // FIXME: appropreate error type
  throw new Error();
}

export async function getChannelFromTextTopic(topic: string, pattern: string): Promise<string> {
  const re = await channelPatternToRegexp(pattern);
  const match = topic.match(re);
  if (match === null) {
  // FIXME: appropreate error type
    throw new Error();
  }
  return match.groups!.channel;
}
