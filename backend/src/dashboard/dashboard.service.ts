import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [byStatus, byProject, byUser] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['projectId'],
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['assignedTo'],
        _count: { _all: true },
      }),
    ]);

    const [projects, users] = await Promise.all([
      this.prisma.project.findMany({
        select: { id: true, name: true },
      }),
      this.prisma.user.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const projectNames = new Map(projects.map((item) => [item.id, item.name]));
    const userNames = new Map(users.map((item) => [item.id, item.name]));

    return {
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      byProject: byProject.map((item) => ({
        project_id: item.projectId,
        project_name: projectNames.get(item.projectId) ?? 'Unknown',
        count: item._count._all,
      })),
      byUser: byUser.map((item) => ({
        user_id: item.assignedTo,
        user_name: userNames.get(item.assignedTo) ?? 'Unknown',
        count: item._count._all,
      })),
    };
  }
}
