import Messages from '../language/en/message.language';
import CustomError from './customError.utility';

export interface IJobCursor {
  urgent: boolean;
  createdAt: Date;
  id: string;
}

interface IJobCursorSource {
  urgent: boolean;
  createdAt: Date;
  id: string;
}

export const encodeJobCursor = (job: IJobCursorSource) => {
  const payload = {
    urgent: Boolean(job.urgent),
    createdAt: new Date(job.createdAt).toISOString(),
    id: job.id,
  };

  return Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeJobCursor = (cursor?: string): IJobCursor | undefined => {
  if (!cursor) return undefined;

  try {
    const normalized = cursor.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    const parsed = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    const createdAt = new Date(parsed.createdAt);

    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.urgent !== 'boolean' ||
      Number.isNaN(createdAt.getTime())
    ) {
      throw new Error('Malformed cursor');
    }

    return {
      urgent: parsed.urgent,
      createdAt,
      id: parsed.id,
    };
  } catch {
    throw new CustomError(400, Messages.INVALID_CURSOR);
  }
};
