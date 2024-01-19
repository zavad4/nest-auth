import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(`HTTP`);

  private redactSensitiveInfo(data: Record<string, any>): Record<string, any> {
    const sanitizedObject: Record<string, any> = {};

    for (const key of Object.keys(data)) {
      if (key.match(/pass/gi)) sanitizedObject[key] = '**SENSITIVE DATA**';
      else if (key === 'data' && typeof data[key] === 'object') {
        sanitizedObject[key] = this.redactSensitiveInfo(data[key]);
      } else {
        sanitizedObject[key] = data[key];
      }
    }

    return sanitizedObject;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, params, body } = req;

    this.logger.log(
      `HTTP request ${url} ${JSON.stringify(
        this.redactSensitiveInfo({ ...params, ...body }),
      )}`,
    );

    next();

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      this.logger.log(
        `HTTP response ${method} ${url} ${statusCode} ${statusMessage}}`,
      );
    });
  }
}
