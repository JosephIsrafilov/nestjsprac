"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_ACTION_TYPE = exports.TASK_PRIORITY = exports.TASK_STATUS = exports.USER_ROLE = void 0;
exports.USER_ROLE = {
    admin: 'admin',
    member: 'member',
};
exports.TASK_STATUS = {
    todo: 'todo',
    in_progress: 'in_progress',
    review: 'review',
    done: 'done',
};
exports.TASK_PRIORITY = {
    low: 'low',
    medium: 'medium',
    high: 'high',
};
exports.TASK_ACTION_TYPE = {
    status_changed: 'status_changed',
    reassigned: 'reassigned',
    edited: 'edited',
};
//# sourceMappingURL=constants.js.map