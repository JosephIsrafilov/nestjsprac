import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [statusGroups, projectGroups, userGroups] = await Promise.all([
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

    const projectNameById = new Map(
      projects.map((project) => [project.id, project.name]),
    );
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
}
