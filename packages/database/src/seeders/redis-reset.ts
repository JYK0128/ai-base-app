import { createConnection, type Socket } from 'node:net';
import { connect as createTlsConnection, type TLSSocket } from 'node:tls';

const REDIS_URL = process.env.REDIS_URL?.trim();

type RedisSocket = Socket | TLSSocket;

const buildRespCommand = (...parts: string[]) => (
  `*${parts.length}\r\n${parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('')}`
);

const readSimpleReply = async (socket: RedisSocket): Promise<string> => (
  await new Promise<string>((resolve, reject) => {
    let buffer = '';

    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
      socket.off('end', onEnd);
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const lineEnd = buffer.indexOf('\r\n');
      if (lineEnd === -1) return;

      cleanup();
      resolve(buffer.slice(0, lineEnd));
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onEnd = () => {
      cleanup();
      reject(new Error('Redis connection closed before reply was received.'));
    };

    socket.on('data', onData);
    socket.on('error', onError);
    socket.on('end', onEnd);
  })
);

const sendRedisCommand = async (socket: RedisSocket, ...parts: string[]): Promise<void> => {
  socket.write(buildRespCommand(...parts));
  const reply = await readSimpleReply(socket);

  if (reply.startsWith('-')) {
    throw new Error(reply.slice(1));
  }
};

const createRedisSocket = (url: URL): RedisSocket => {
  const host = url.hostname;
  const port = Number(url.port || 6379);

  if (url.protocol === 'rediss:') {
    return createTlsConnection({
      host,
      port,
      servername: host,
    });
  }

  return createConnection({
    host,
    port,
  });
};

export async function resetRedis(): Promise<void> {
  if (!REDIS_URL) {
    return;
  }

  const url = new URL(REDIS_URL);
  const socket = createRedisSocket(url);

  try {
    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('secureConnect', resolve);
      socket.once('error', reject);
    });

    if (url.username || url.password) {
      if (url.username && url.password) {
        await sendRedisCommand(socket, 'AUTH', url.username, url.password);
      }
      else if (url.password) {
        await sendRedisCommand(socket, 'AUTH', url.password);
      }
    }

    const dbIndex = url.pathname.replace(/^\//, '').trim();
    if (dbIndex.length > 0 && dbIndex !== '0') {
      await sendRedisCommand(socket, 'SELECT', dbIndex);
    }

    await sendRedisCommand(socket, 'FLUSHDB');
    await sendRedisCommand(socket, 'QUIT');
  }
  finally {
    socket.destroy();
  }
}
