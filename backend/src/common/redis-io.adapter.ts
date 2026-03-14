import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import Redis from 'ioredis'

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter: ReturnType<typeof createAdapter> | null = null

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      return
    }
    const pubClient = new Redis(redisUrl)
    const subClient = pubClient.duplicate()
    this.redisAdapter = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options)
    if (this.redisAdapter) {
      server.adapter(this.redisAdapter)
    }
    return server
  }
}
