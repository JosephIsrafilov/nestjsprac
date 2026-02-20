import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserType } from '../types/current-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserType => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: CurrentUserType }>();
    return request.user;
  },
);
