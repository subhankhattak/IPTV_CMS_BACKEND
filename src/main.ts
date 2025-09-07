import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json } from "express";
import * as basicAuth from "express-basic-auth";
import * as cluster from "cluster";
import { RedisIoAdapter } from "redis.adapter";
const clusterWorker = cluster as unknown as cluster.Cluster;

const logger = new Logger("Main");

async function bootstrap() {
  const SWAGGER_ENVS = ["LOCAL", "DEV"];
  const app = await NestFactory.create(AppModule, {
    cors: true, // Enables default CORS settings
  });

  //Redis Socket Adapter
  // const redisAdapter = new RedisIoAdapter(app);
  // await redisAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisAdapter);

  if (SWAGGER_ENVS.includes(process.env.NODE_ENV)) {
    app.use(
      ["/api-docs"],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
        },
      })
    );
  }
  //global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  //Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle("IPTV Backend API Documentation")
    .setDescription(
      "API documentation for the IPTV platform: applications, categories, sub-categories, bouquets, auth, and users."
    )
    .addBearerAuth()
    .addServer(
      `http://localhost:${process.env.PORT}`,
      "Local Environment (localhost)"
    )
    .addServer(
      `http://127.0.0.1:${process.env.PORT}`,
      "Local Environment (127.0.0.1)"
    )
    .setVersion("1.0")
    .build();

  //Instantiate Swagger document
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "IPTV Backend API Documentation",
  });

  //enable cors
  app.enableCors({
    origin: true, // Allow all origins for development
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Referer",
      "User-Agent",
    ],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(json({ limit: "50mb" }));

  await app.listen(process.env.PORT, () => {
    logger.log(`Server is running on port ${process.env.PORT}`);
  });
  logger.log(`Worker ${process.pid} started on port ${process.env.PORT}`);
}

if (process.env.NODE_ENV == "LOCAL") bootstrap();
else {
  if (!clusterWorker.isPrimary) bootstrap();
  else {
    // Fork workers for each CPU core
    const numCPUs = 3; //cpus().length;
    logger.log("numCPUs", numCPUs);
    logger.log(`Master process ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
      logger.log({ CLUSTER_WORKER_INSTANCE: i.toString() });
      clusterWorker.fork({ CLUSTER_WORKER_INSTANCE: i.toString() });
    }

    clusterWorker.on("exit", (worker, code, signal) => {
      logger.log(`Worker ${worker.process.pid} died. Restarting...`);
      clusterWorker.fork();
    });
  }
}
