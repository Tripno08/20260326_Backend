# Relatórios e Comunicação - Innerview Backend

## Visão Geral

O Innerview Backend implementa recursos avançados de geração de relatórios e comunicação para facilitar a interação entre educadores, alunos e famílias.

## Geração de Relatórios

### 1. Serviço de Relatórios
```typescript
@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templateEngine: TemplateEngine,
    private readonly pdfGenerator: PdfGenerator,
  ) {}

  async generateReport(
    type: ReportType,
    context: ReportContext,
  ): Promise<Report> {
    const data = await this.gatherReportData(context);
    const template = await this.getReportTemplate(type);
    
    const content = await this.templateEngine.render(template, data);
    const pdf = await this.pdfGenerator.generate(content);

    return this.saveReport(type, context, pdf);
  }

  private async gatherReportData(context: ReportContext): Promise<ReportData> {
    const { studentId, timeframe, subjects } = context;
    
    return {
      student: await this.getStudentData(studentId),
      performance: await this.getPerformanceData(studentId, timeframe),
      attendance: await this.getAttendanceData(studentId, timeframe),
      behavior: await this.getBehaviorData(studentId, timeframe),
      subjects: await this.getSubjectData(studentId, subjects),
    };
  }
}
```

### 2. Templates de Relatórios
```typescript
@Injectable()
export class ReportTemplateService {
  constructor(private readonly templateEngine: TemplateEngine) {}

  async getReportTemplate(type: ReportType): Promise<Template> {
    const template = await this.templateEngine.loadTemplate(
      `reports/${type}.template`,
    );
    
    return this.validateTemplate(template);
  }

  async customizeTemplate(
    template: Template,
    customization: TemplateCustomization,
  ): Promise<Template> {
    return this.templateEngine.customize(template, customization);
  }
}
```

## Comunicação com Famílias

### 1. Serviço de Notificações
```typescript
@Injectable()
export class FamilyNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async sendNotification(
    type: NotificationType,
    context: NotificationContext,
  ): Promise<void> {
    const recipients = await this.getRecipients(context);
    const content = await this.generateNotificationContent(type, context);

    await Promise.all(
      recipients.map(recipient =>
        this.sendToRecipient(recipient, content),
      ),
    );
  }

  private async sendToRecipient(
    recipient: Recipient,
    content: NotificationContent,
  ): Promise<void> {
    if (recipient.preferences.email) {
      await this.emailService.send(recipient.email, content);
    }

    if (recipient.preferences.sms) {
      await this.smsService.send(recipient.phone, content);
    }
  }
}
```

### 2. Portal de Famílias
```typescript
@Injectable()
export class FamilyPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createFamilyAccount(
    data: FamilyAccountData,
  ): Promise<FamilyAccount> {
    const account = await this.prisma.familyAccount.create({
      data: {
        ...data,
        password: await this.authService.hashPassword(data.password),
      },
    });

    await this.setupFamilyAccess(account);
    return account;
  }

  private async setupFamilyAccess(account: FamilyAccount): Promise<void> {
    const students = await this.getAssociatedStudents(account);
    
    await this.prisma.familyAccess.createMany({
      data: students.map(student => ({
        familyAccountId: account.id,
        studentId: student.id,
        accessLevel: 'view',
      })),
    });
  }
}
```

## Colaboração e Documentação

### 1. Sistema de Comentários
```typescript
@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment(
    context: CommentContext,
    content: string,
  ): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        content,
        contextType: context.type,
        contextId: context.id,
        authorId: context.authorId,
      },
    });

    await this.notifyRelevantParties(comment);
    return comment;
  }

  private async notifyRelevantParties(comment: Comment): Promise<void> {
    const relevantUsers = await this.getRelevantUsers(comment);
    await this.notificationService.notifyUsers(relevantUsers, {
      type: 'new_comment',
      comment,
    });
  }
}
```

### 2. Documentação de Intervenções
```typescript
@Injectable()
export class InterventionDocumentationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async documentIntervention(
    interventionId: string,
    documentation: InterventionDocumentation,
  ): Promise<Documentation> {
    const intervention = await this.getIntervention(interventionId);
    
    const documentation = await this.prisma.documentation.create({
      data: {
        interventionId,
        content: documentation.content,
        attachments: await this.processAttachments(
          documentation.attachments,
        ),
        authorId: documentation.authorId,
      },
    });

    await this.updateInterventionStatus(interventionId);
    return documentation;
  }

  private async processAttachments(
    attachments: File[],
  ): Promise<Attachment[]> {
    return Promise.all(
      attachments.map(async file => {
        const storedFile = await this.fileService.store(file);
        return {
          filename: file.originalname,
          path: storedFile.path,
          type: file.mimetype,
        };
      }),
    );
  }
}
```

## Compartilhamento de Recursos

### 1. Biblioteca de Recursos
```typescript
@Injectable()
export class ResourceLibraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async addResource(
    resource: ResourceData,
    file: File,
  ): Promise<Resource> {
    const storedFile = await this.fileService.store(file);
    
    return this.prisma.resource.create({
      data: {
        ...resource,
        filePath: storedFile.path,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
  }

  async searchResources(
    query: ResourceSearchQuery,
  ): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: {
        title: { contains: query.term },
        type: query.type,
        subject: query.subject,
        grade: query.grade,
      },
      include: {
        author: true,
        tags: true,
      },
    });
  }
}
```

### 2. Compartilhamento de Conteúdo
```typescript
@Injectable()
export class ContentSharingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async shareContent(
    contentId: string,
    recipients: Recipient[],
  ): Promise<void> {
    const content = await this.getContent(contentId);
    
    await this.prisma.contentShare.createMany({
      data: recipients.map(recipient => ({
        contentId,
        recipientId: recipient.id,
        accessLevel: recipient.accessLevel,
      })),
    });

    await this.notifyRecipients(recipients, content);
  }

  private async notifyRecipients(
    recipients: Recipient[],
    content: Content,
  ): Promise<void> {
    await this.notificationService.notifyUsers(recipients, {
      type: 'shared_content',
      content,
    });
  }
}
```

## Análise de Engajamento

### 1. Métricas de Engajamento
```typescript
@Injectable()
export class EngagementMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateEngagementMetrics(
    context: EngagementContext,
  ): Promise<EngagementMetrics> {
    const data = await this.gatherEngagementData(context);
    
    return {
      participationRate: this.calculateParticipationRate(data),
      responseTime: this.calculateResponseTime(data),
      interactionQuality: this.calculateInteractionQuality(data),
      feedbackScore: this.calculateFeedbackScore(data),
    };
  }

  private async gatherEngagementData(
    context: EngagementContext,
  ): Promise<EngagementData> {
    return {
      interactions: await this.getInteractions(context),
      responses: await this.getResponses(context),
      feedback: await this.getFeedback(context),
    };
  }
}
```

### 2. Relatórios de Engajamento
```typescript
@Injectable()
export class EngagementReportService {
  constructor(
    private readonly metricsService: EngagementMetricsService,
    private readonly reportService: ReportService,
  ) {}

  async generateEngagementReport(
    context: EngagementContext,
  ): Promise<Report> {
    const metrics = await this.metricsService.calculateEngagementMetrics(
      context,
    );

    return this.reportService.generateReport('engagement', {
      ...context,
      metrics,
    });
  }
}
``` 