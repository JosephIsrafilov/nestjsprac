"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserData = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUserData = (0, common_1.createParamDecorator)((_data, context) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
});
//# sourceMappingURL=current-user.decorator.js.map