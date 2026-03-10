import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../services/email.service';

@Injectable()
@Processor('notifications')
export class NotificationsProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Process('task-assigned')
  async handleTaskAssigned(job: Job<{ taskId: number }>): Promise<void> {
    const task = await this.getTaskEmailContext(job.data.taskId);
    if (!task) {
      return;
    }

    await this.emailService.sendTaskAssignedEmail(task);
  }

  @Process('task-due-soon')
  async handleTaskDueSoon(job: Job<{ taskId: number }>): Promise<void> {
    const task = await this.getTaskEmailContext(job.data.taskId);
    if (!task || !task.dueDate) {
      return;
    }

    await this.emailService.sendTaskDueSoonEmail(task);
  }

  private async getTaskEmailContext(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignee: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return {
      assigneeEmail: task.assignee.email,
      assigneeName: task.assignee.name,
      dueDate: task.dueDate,
      priority: task.priority,
      projectName: task.project.name,
      taskDescription: task.description,
      taskTitle: task.title,
    };
  }
}
