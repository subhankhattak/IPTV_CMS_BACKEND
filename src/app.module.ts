import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import appConfig from "./config/app.config";
import environmentValidation from "./config/environment.validation";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { TestModule } from "./test/test.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import typeormConfig from "./config/typeorm.config";
import { DataResponseInterceptor } from "./common/interceptors/data-response.interceptor";
import { RequestLoggerInterceptor } from "./common/interceptors/request-logger.interceptor";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { PostgresExceptionInterceptor } from "./common/interceptors/postgres-exception.interceptor";
import { HttpExceptionInterceptor } from "./common/interceptors/http-exception.interceptor";
import { ExcludePasswordInterceptor } from "./common/interceptors/exclude-password.interceptor";
import { DateSerializationInterceptor } from "./common/interceptors/date-serialization.interceptor";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { ApplicationsModule } from "./applications/applications.module";
import { CategoriesModule } from "./categories/categories.module";
import { SubCategoriesModule } from "./sub-categories/sub-categories.module";
import { ApplicationCategoriesModule } from "./application-categories/application-categories.module";
import { ApplicationSubCategoriesModule } from "./application-sub-categories/application-sub-categories.module";
import { BouquetsModule } from "./bouquets/bouquets.module";
import { StreamsModule } from "./streams/streams.module";
import { MoviesModule } from "./movies/movies.module";
import { SeriesModule } from "./series/series.module";
import { DramasModule } from "./dramas/dramas.module";
import { RadiosModule } from "./radios/radios.module";
import { AuthenticationGuard } from "./auth/guards/authentication/authentication.guard";

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    /**
     * Static files
     */
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../", "public"),
      serveRoot: "/",
      exclude: ["/api*", "/swagger*"],
    }),
    /**
     * Environment Config
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? ".env" : `.env.${ENV}`,
      load: [appConfig, typeormConfig],
      validationSchema: environmentValidation,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<TypeOrmModuleOptions> => {
        const typeOrmConfig =
          configService.get<TypeOrmModuleOptions>("typeorm");
        if (!typeOrmConfig) {
          throw new Error("TypeORM configuration is not defined");
        }
        return typeOrmConfig;
      },
    }),
    TestModule,
    UsersModule,
    AuthModule,
    ApplicationsModule,
    CategoriesModule,
    SubCategoriesModule,
    ApplicationCategoriesModule,
    ApplicationSubCategoriesModule,
    BouquetsModule,
    StreamsModule,
    MoviesModule,
    SeriesModule,
    DramasModule,
    RadiosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PostgresExceptionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpExceptionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ExcludePasswordInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DateSerializationInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AppModule {}
