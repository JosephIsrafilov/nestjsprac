import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import type { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

const DUE_REMINDER_PREFIX = 'task-due-reminder';
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const QUEUE_ACTION_TIMEOUT_MS = 1200;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async queueTaskAssignedEmail(taskId: number): Promise<void> {
    await this.runSafely(`queue assignment email for task ${taskId}`, () =>
      this.notificationsQueue.add(
        'task-assigned',
        { taskId },
        {
          removeOnComplete: true,
          removeOnFail: 50,
        },
      ),
    );
  }

  async syncTaskDueDateReminder(taskId: number): Promise<void> {
    await this.runSafely(`sync due date reminder for task ${taskId}`, async () => {
      await this.clearTaskDueDateReminder(taskId);

      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          dueDate: true,
          status: true,
        },
      });

      if (!task || !task.dueDate || task.status === TaskStatus.done) {
        return;
      }

      if (task.dueDate.getTime() <= Date.now()) {
        return;
      }

      const reminderAt = task.dueDate.getTime() - DAY_IN_MS;
      const delay = Math.max(reminderAt - Date.now(), 0);

      await this.notificationsQueue.add(
        'task-due-soon',
        { taskId },
        {
          delay,
          jobId: `${DUE_REMINDER_PREFIX}-${task.id}-${task.dueDate.getTime()}`,
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );
    });
  }

  async clearTaskDueDateReminder(taskId: number): Promise<void> {
    await this.runSafely(`clear due date reminder for task ${taskId}`, async () => {
      const jobs = await this.notificationsQueue.getJobs(['delayed', 'waiting']);

      await Promise.all(
        jobs
          .filter((job) =>
            String(job.id).startsWith(`${DUE_REMINDER_PREFIX}-${taskId}-`),
          )
          .map((job) => job.remove().catch(() => undefined)),
      );
    });
  }

  private async runSafely(
    action: string,
    callback: () => Promise<unknown>,
  ): Promise<void> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        callback(),
        new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => {
            reject(
              new Error(
                `Queue operation timed out after ${QUEUE_ACTION_TIMEOUT_MS}ms`,
              ),
            );
          }, QUEUE_ACTION_TIMEOUT_MS);
        }),
      ]);
    } catch (error) {
      this.logger.warn(
        `Skipping notification action "${action}" due to queue error: ${(error as Error).message}`,
      );
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }
}
