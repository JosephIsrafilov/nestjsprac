"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../common/constants");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, currentUser) {
        const project = await this.prisma.project.findUnique({
            where: { id: dto.project_id },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const assignee = await this.prisma.user.findUnique({
            where: { id: dto.assigned_to },
        });
        if (!assignee) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role === constants_1.USER_ROLE.member &&
            project.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only create tasks in your own projects');
        }
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                priority: dto.priority,
                projectId: dto.project_id,
                assignedTo: dto.assigned_to,
                dueDate: dto.due_date
                    ? this.parseDateOnly(dto.due_date, 'due_date')
                    : null,
            },
        });
    }
    list(query) {
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.assigned_to) {
            where.assignedTo = query.assigned_to;
        }
        if (query.due_from || query.due_to) {
            const dueDateFilter = {};
            if (query.due_from) {
                dueDateFilter.gte = this.parseDateOnly(query.due_from, 'due_from');
            }
            if (query.due_to) {
                dueDateFilter.lte = this.parseDateOnly(query.due_to, 'due_to');
            }
            where.dueDate = dueDateFilter;
        }
        if (query.search && query.search.trim()) {
            where.OR = [
                {
                    title: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: query.search.trim(),
                        mode: 'insensitive',
                    },
                },
            ];
        }
        return this.prisma.task.findMany({
            where,
            orderBy: { id: 'asc' },
        });
    }
    async update(taskId, dto, currentUser) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    select: {
                        createdBy: true,
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (currentUser.role === constants_1.USER_ROLE.member &&
            task.project.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only update tasks in your own projects');
        }
        if (dto.status &&
            task.status === constants_1.TASK_STATUS.done &&
            dto.status !== constants_1.TASK_STATUS.done) {
            throw new common_1.BadRequestException("Can't change a task back from done");
        }
        if (dto.project_id && dto.project_id !== task.projectId) {
            throw new common_1.BadRequestException('Cannot move task to another project');
        }
        if (dto.assigned_to) {
            const user = await this.prisma.user.findUnique({
                where: { id: dto.assigned_to },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
        }
        const updateData = {};
        if (dto.title !== undefined) {
            updateData.title = dto.title;
        }
        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }
        if (dto.status !== undefined) {
            updateData.status = dto.status;
        }
        if (dto.priority !== undefined) {
            updateData.priority = dto.priority;
        }
        if (dto.assigned_to !== undefined) {
            updateData.assignee = {
                connect: { id: dto.assigned_to },
            };
        }
        if (dto.due_date !== undefined) {
            updateData.dueDate = this.parseDateOnly(dto.due_date, 'due_date');
        }
        const activities = [];
        if (dto.status !== undefined && dto.status !== task.status) {
            activities.push({
                taskId,
                actionType: constants_1.TASK_ACTION_TYPE.status_changed,
                oldValue: task.status,
                newValue: dto.status,
                changedBy: currentUser.id,
            });
        }
        if (dto.assigned_to !== undefined && dto.assigned_to !== task.assignedTo) {
            activities.push({
                taskId,
                actionType: constants_1.TASK_ACTION_TYPE.reassigned,
                oldValue: String(task.assignedTo),
                newValue: String(dto.assigned_to),
                changedBy: currentUser.id,
            });
        }
        if (dto.title !== undefined && dto.title !== task.title) {
            activities.push({
                taskId,
                actionType: constants_1.TASK_ACTION_TYPE.edited,
                oldValue: task.title,
                newValue: dto.title,
                changedBy: currentUser.id,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.task.update({
                where: { id: taskId },
                data: updateData,
            });
            if (activities.length > 0) {
                await tx.taskActivity.createMany({
                    data: activities,
                });
            }
            return updated;
        });
    }
    async getActivity(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.taskActivity.findMany({
            where: { taskId },
            orderBy: { timestamp: 'desc' },
        });
    }
    parseDateOnly(value, fieldName) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new common_1.BadRequestException(`${fieldName} must be YYYY-MM-DD format`);
        }
        const [yearPart, monthPart, dayPart] = value.split('-');
        const year = Number(yearPart);
        const month = Number(monthPart);
        const day = Number(dayPart);
        const date = new Date(Date.UTC(year, month - 1, day));
        const isValid = date.getUTCFullYear() === year &&
            date.getUTCMonth() + 1 === month &&
            date.getUTCDate() === day;
        if (!isValid) {
            throw new common_1.BadRequestException(`${fieldName} is not a valid calendar date`);
        }
        return date;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map