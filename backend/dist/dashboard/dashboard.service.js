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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const [statusGroups, projectGroups, userGroups] = await Promise.all([
            this.prisma.task.groupBy({
                by: ['status'],
                _count: {
                    _all: true,
                },
            }),
            this.prisma.task.groupBy({
                by: ['projectId'],
                _count: {
                    _all: true,
                },
            }),
            this.prisma.task.groupBy({
                by: ['assignedTo'],
                _count: {
                    _all: true,
                },
            }),
        ]);
        const [projects, users] = await Promise.all([
            this.prisma.project.findMany({
                select: {
                    id: true,
                    name: true,
                },
            }),
            this.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                },
            }),
        ]);
        const projectNameById = new Map(projects.map((project) => [project.id, project.name]));
        const userNameById = new Map(users.map((user) => [user.id, user.name]));
        return {
            byStatus: statusGroups.map((item) => ({
                status: item.status,
                count: item._count._all,
            })),
            byProject: projectGroups.map((item) => ({
                project_id: item.projectId,
                project_name: projectNameById.get(item.projectId) ?? 'Unknown project',
                count: item._count._all,
            })),
            byUser: userGroups.map((item) => ({
                user_id: item.assignedTo,
                user_name: userNameById.get(item.assignedTo) ?? 'Unknown user',
                count: item._count._all,
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map