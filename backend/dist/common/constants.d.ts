export declare const USER_ROLE: {
    readonly admin: "admin";
    readonly member: "member";
};
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export declare const TASK_STATUS: {
    readonly todo: "todo";
    readonly in_progress: "in_progress";
    readonly review: "review";
    readonly done: "done";
};
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export declare const TASK_PRIORITY: {
    readonly low: "low";
    readonly medium: "medium";
    readonly high: "high";
};
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
export declare const TASK_ACTION_TYPE: {
    readonly status_changed: "status_changed";
    readonly reassigned: "reassigned";
    readonly edited: "edited";
};
