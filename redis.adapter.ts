import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { Logger } from "@nestjs/common";

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<void> {
    const redisHost = process.env.REDIS_HOST || "18.159.212.20";
    const redisPort = process.env.REDIS_PORT || 6379;
    const redisUrl = `redis://${redisHost}:${redisPort}`;

    this.logger.log(`Connecting to Redis at ${redisUrl}`);

    const pubClient = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    const subClient = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    pubClient.on("error", (err) =>
      this.logger.error("PubClient Redis Error:", err)
    );
    subClient.on("error", (err) =>
      this.logger.error("SubClient Redis Error:", err)
    );

    pubClient.on("connect", () => this.logger.log("PubClient connected to Redis."));
    subClient.on("connect", () => this.logger.log("SubClient connected to Redis."));

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    } else {
      this.logger.warn(
        "Redis adapter is not initialized. Make sure connectToRedis() is called before starting the server."
      );
    }
    return server;
  }
}
