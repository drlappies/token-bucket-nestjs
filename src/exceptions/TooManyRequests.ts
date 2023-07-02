import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor() {
    super('Too many reqs', HttpStatus.TOO_MANY_REQUESTS);
  }
}
