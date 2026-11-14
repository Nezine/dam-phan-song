import type { CustomerReply } from './types';

// Bound both connection and body reads so a stalled provider can fall back.
export async function fetchAiJson(url: string, init: RequestInit): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`AI HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error('AI request timeout');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function parseReply(raw: string): CustomerReply {
  const reply = JSON.parse(raw);
  if (!reply || typeof reply.message !== 'string' || !reply.message.trim()
    || typeof reply.agreed !== 'boolean') {
    throw new Error('Invalid AI reply');
  }
  for (const key of ['currentPrice', 'agreedPrice']) {
    if (reply[key] != null && (typeof reply[key] !== 'number'
      || !Number.isFinite(reply[key]) || reply[key] <= 0)) {
      throw new Error('Invalid AI price');
    }
  }
  if (reply.agreed && reply.agreedPrice == null) throw new Error('Missing agreed price');
  if (!['friendly', 'neutral', 'annoyed'].includes(reply.emotion)) reply.emotion = 'neutral';
  return reply as CustomerReply;
}
