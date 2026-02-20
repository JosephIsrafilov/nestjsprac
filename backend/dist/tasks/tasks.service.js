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
const client_1 = require("@prisma/client");
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
            throw new common_1.NotFoundException('Project was not found');
        }
        const assignee = await this.prisma.user.findUnique({
            where: { id: dto.assigned_to },
        });
        if (!assignee) {
            throw new common_1.NotFoundException('Assigned user was not found');
        }
        if (currentUser.role === client_1.UserRole.member &&
            project.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Members can only create tasks in their own projects');
        }
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                priority: dto.priority,
                projectId: dto.project_id,
                assignedTo: dto.assigned_to,
                dueDate: dto.due_date ? new Date(dto.due_date) : null,
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
                dueDateFilter.gte = new Date(query.due_from);
            }
            if (query.due_to) {
                dueDateFilter.lte = new Date(query.due_to);
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
        const existingTask = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    select: {
                        createdBy: true,
                    },
                },
            },
        });
        if (!existingTask) {
            throw new common_1.NotFoundException('Task was not found');
        }
        if (currentUser.role === client_1.UserRole.member &&
            existingTask.project.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Members can only update tasks in their own projects');
        }
        if (dto.status &&
            existingTask.status === client_1.TaskStatus.done &&
            dto.status !== client_1.TaskStatus.done) {
            throw new common_1.BadRequestException('Task status cannot move from done to another state');
        }
        if (dto.project_id && dto.project_id !== existingTask.projectId) {
            throw new common_1.BadRequestException('Changing project_id is not allowed');
        }
        if (dto.assigned_to) {
            const newAssignee = await this.prisma.user.findUnique({
                where: { id: dto.assigned_to },
            });
            if (!newAssignee) {
                throw new common_1.NotFoundException('Assigned user was not found');
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
            updateData.dueDate = new Date(dto.due_date);
        }
        const activities = [];
        if (dto.status !== undefined && dto.status !== existingTask.status) {
            activities.push({
                taskId,
                actionType: client_1.TaskActionType.status_changed,
                oldValue: existingTask.status,
                newValue: dto.status,
                changedBy: currentUser.id,
            });
        }
        if (dto.assigned_to !== undefined &&
            dto.assigned_to !== existingTask.assignedTo) {
            activities.push({
                taskId,
                actionType: client_1.TaskActionType.reassigned,
                oldValue: String(existingTask.assignedTo),
                newValue: String(dto.assigned_to),
                changedBy: currentUser.id,
            });
        }
        if (dto.title !== undefined && dto.title !== existingTask.title) {
            activities.push({
                taskId,
                actionType: client_1.TaskActionType.edited,
                oldValue: existingTask.title,
                newValue: dto.title,
                changedBy: currentUser.id,
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTask = await tx.task.update({
                where: { id: taskId },
                data: updateData,
            });
            if (activities.length > 0) {
                await tx.taskActivity.createMany({
                    data: activities,
                });
            }
            return updatedTask;
        });
    }
    async getActivity(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task was not found');
        }
        return this.prisma.taskActivity.findMany({
            where: { taskId },
            orderBy: { timestamp: 'desc' },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map