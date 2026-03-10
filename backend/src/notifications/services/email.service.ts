import { Injectable, Logger } from '@nestjs/common';
import { TaskPriority } from '@prisma/client';
import nodemailer, { type Transporter } from 'nodemailer';

type TaskEmailContext = {
  assigneeEmail: string;
  assigneeName: string;
  dueDate: Date | null;
  priority: TaskPriority;
  projectName: string;
  taskDescription: string;
  taskTitle: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromEmail =
    process.env.EMAIL_FROM ?? 'noreply@taskmanager.local';

  constructor() {
    this.transporter = this.createTransporter();
  }

  async sendTaskAssignedEmail(context: TaskEmailContext): Promise<void> {
    const subject = `New task assigned: ${context.taskTitle}`;
    const text = [
      `Hello ${context.assigneeName},`,
      '',
      `You have been assigned a new task in "${context.projectName}".`,
      `Title: ${context.taskTitle}`,
      `Priority: ${context.priority}`,
      `Due date: ${context.dueDate?.toISOString() ?? 'Not set'}`,
      '',
      context.taskDescription,
    ].join('\n');

    await this.sendMail(context.assigneeEmail, subject, text);
  }

  async sendTaskDueSoonEmail(context: TaskEmailContext): Promise<void> {
    const subject = `Deadline reminder: ${context.taskTitle}`;
    const text = [
      `Hello ${context.assigneeName},`,
      '',
      `The deadline for "${context.taskTitle}" is approaching.`,
      `Project: ${context.projectName}`,
      `Priority: ${context.priority}`,
      `Due date: ${context.dueDate?.toISOString() ?? 'Not set'}`,
      '',
      context.taskDescription,
    ].join('\n');

    await this.sendMail(context.assigneeEmail, subject, text);
  }

  private createTransporter(): Transporter | null {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.logger.warn(
        'SMTP_HOST is not configured, email notifications will be logged only',
      );
      return null;
    }

    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  private async sendMail(
    recipient: string,
    subject: string,
    text: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        JSON.stringify({
          channel: 'email-log',
          to: recipient,
          subject,
          text,
        }),
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: recipient,
      subject,
      text,
    });
  }
}
