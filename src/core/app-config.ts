import { Logger } from '@nestjs/common';

export interface ApplicationConfig {
  app: {
    port: number;
    env: string;
  };
  jwtSecret: string;
  db: {
    pg: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };
  };
}

const logger = new Logger('ConfigLoader');

export const configurationLoader = (): ApplicationConfig => {
  const config: ApplicationConfig = {
    app: {
      port: parseInt(process.env.PORT, 10) || 3000,
      env:
        typeof process.env.APP_ENV !== 'undefined'
          ? String(process.env.APP_ENV)
          : 'development',
    },
    jwtSecret: process.env.JWT_SECRET || 'secret',
    db: {
      pg: {
        host: String(process.env.PG_HOST),
        port: parseInt(process.env.PG_PORT, 10) || 5432,
        database: String(process.env.PG_DATABASE),
        username: String(process.env.PG_USERNAME),
        password: String(process.env.PG_PASSWORD),
      },
    },
  };

  logger.debug(
    `Loaded valid configuration: ${JSON.stringify(config, null, 2)}`
  );

  return config;
};
