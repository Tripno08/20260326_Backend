# Suporte para Experiência Mobile e de Campo - Innerview Backend

## Visão Geral

O Innerview Backend implementa recursos específicos para suportar a experiência mobile e de campo, garantindo uma experiência consistente e eficiente em diferentes contextos.

## Design Responsivo

### 1. Adaptação de Conteúdo
```typescript
@Injectable()
export class ResponsiveContentService {
  constructor(private readonly contentService: ContentService) {}

  async getResponsiveContent(
    contentId: string,
    device: DeviceInfo,
  ): Promise<ResponsiveContent> {
    const content = await this.contentService.getContent(contentId);
    
    return {
      ...content,
      layout: this.getOptimalLayout(device),
      media: await this.getOptimizedMedia(content.media, device),
      navigation: this.getAdaptedNavigation(device),
    };
  }

  private getOptimalLayout(device: DeviceInfo): Layout {
    if (device.type === 'mobile') {
      return {
        columns: 1,
        spacing: 'compact',
        navigation: 'bottom',
      };
    }

    if (device.type === 'tablet') {
      return {
        columns: 2,
        spacing: 'medium',
        navigation: 'side',
      };
    }

    return {
      columns: 3,
      spacing: 'comfortable',
      navigation: 'top',
    };
  }
}
```

### 2. Otimização de Mídia
```typescript
@Injectable()
export class MediaOptimizationService {
  constructor(
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
  ) {}

  async optimizeMedia(
    media: Media,
    device: DeviceInfo,
  ): Promise<OptimizedMedia> {
    if (media.type === 'image') {
      return this.optimizeImage(media, device);
    }

    if (media.type === 'video') {
      return this.optimizeVideo(media, device);
    }

    return media;
  }

  private async optimizeImage(
    image: Image,
    device: DeviceInfo,
  ): Promise<OptimizedImage> {
    const resolution = this.getOptimalResolution(device);
    const format = this.getOptimalFormat(device);
    
    return this.imageService.process(image, {
      resolution,
      format,
      quality: this.getOptimalQuality(device),
    });
  }
}
```

## Funcionalidade Offline

### 1. Sincronização de Dados
```typescript
@Injectable()
export class OfflineSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async syncOfflineData(
    userId: string,
    offlineData: OfflineData,
  ): Promise<void> {
    const pendingChanges = await this.getPendingChanges(userId);
    
    await this.prisma.$transaction(async (prisma) => {
      for (const change of pendingChanges) {
        await this.applyChange(prisma, change);
      }
    });

    await this.updateSyncStatus(userId);
  }

  private async applyChange(
    prisma: PrismaClient,
    change: PendingChange,
  ): Promise<void> {
    switch (change.type) {
      case 'create':
        await prisma[change.model].create({
          data: change.data,
        });
        break;
      case 'update':
        await prisma[change.model].update({
          where: { id: change.id },
          data: change.data,
        });
        break;
      case 'delete':
        await prisma[change.model].delete({
          where: { id: change.id },
        });
        break;
    }
  }
}
```

### 2. Cache de Recursos
```typescript
@Injectable()
export class ResourceCacheService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly resourceService: ResourceService,
  ) {}

  async cacheResources(
    userId: string,
    resources: Resource[],
  ): Promise<void> {
    for (const resource of resources) {
      await this.cacheService.set(
        `resource:${resource.id}`,
        resource,
        this.getCacheDuration(resource),
      );
    }
  }

  async getCachedResource(
    resourceId: string,
  ): Promise<Resource | null> {
    const cached = await this.cacheService.get(`resource:${resourceId}`);
    
    if (cached) {
      return cached;
    }

    const resource = await this.resourceService.getResource(resourceId);
    if (resource) {
      await this.cacheService.set(
        `resource:${resourceId}`,
        resource,
        this.getCacheDuration(resource),
      );
    }

    return resource;
  }
}
```

## Ferramentas de Campo

### 1. Coleta de Dados
```typescript
@Injectable()
export class FieldDataCollectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async collectFieldData(
    formId: string,
    data: FieldData,
    location: Location,
  ): Promise<FieldSubmission> {
    await this.validateFieldData(data);
    
    return this.prisma.fieldSubmission.create({
      data: {
        formId,
        data,
        location,
        timestamp: new Date(),
        status: 'pending',
      },
    });
  }

  private async validateFieldData(data: FieldData): Promise<void> {
    const validationRules = await this.getValidationRules(data.formId);
    await this.validationService.validate(data, validationRules);
  }
}
```

### 2. Geolocalização
```typescript
@Injectable()
export class GeolocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapService: MapService,
  ) {}

  async trackLocation(
    userId: string,
    location: Location,
  ): Promise<void> {
    await this.prisma.locationHistory.create({
      data: {
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: new Date(),
      },
    });

    await this.updateUserLocation(userId, location);
  }

  async getNearbyResources(
    location: Location,
    radius: number,
  ): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: {
        location: {
          near: {
            point: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
            },
            distance: radius,
          },
        },
      },
    });
  }
}
```

## Otimização de Performance

### 1. Compressão de Dados
```typescript
@Injectable()
export class DataCompressionService {
  constructor(private readonly compressionService: CompressionService) {}

  async compressData(
    data: any,
    options: CompressionOptions,
  ): Promise<CompressedData> {
    const compressed = await this.compressionService.compress(
      JSON.stringify(data),
      options,
    );

    return {
      data: compressed,
      size: compressed.length,
      originalSize: JSON.stringify(data).length,
      compressionRatio: this.calculateCompressionRatio(
        compressed.length,
        JSON.stringify(data).length,
      ),
    };
  }

  private calculateCompressionRatio(
    compressedSize: number,
    originalSize: number,
  ): number {
    return ((originalSize - compressedSize) / originalSize) * 100;
  }
}
```

### 2. Gerenciamento de Estado
```typescript
@Injectable()
export class StateManagementService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly syncService: SyncService,
  ) {}

  async updateState(
    userId: string,
    state: State,
  ): Promise<void> {
    await this.cacheService.set(
      `state:${userId}`,
      state,
      this.getStateCacheDuration(),
    );

    if (this.shouldSyncState(state)) {
      await this.syncService.syncState(userId, state);
    }
  }

  async getState(userId: string): Promise<State> {
    const cached = await this.cacheService.get(`state:${userId}`);
    
    if (cached) {
      return cached;
    }

    const state = await this.syncService.getState(userId);
    await this.cacheService.set(
      `state:${userId}`,
      state,
      this.getStateCacheDuration(),
    );

    return state;
  }
}
```

## Segurança Mobile

### 1. Autenticação Mobile
```typescript
@Injectable()
export class MobileAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceService: DeviceService,
  ) {}

  async authenticateDevice(
    deviceId: string,
    credentials: MobileCredentials,
  ): Promise<AuthToken> {
    await this.validateDevice(deviceId);
    
    const token = await this.authService.generateToken({
      deviceId,
      type: 'mobile',
      ...credentials,
    });

    await this.registerDeviceSession(deviceId, token);
    return token;
  }

  private async validateDevice(deviceId: string): Promise<void> {
    const device = await this.deviceService.getDevice(deviceId);
    if (!device || !device.isActive) {
      throw new UnauthorizedException('Device not authorized');
    }
  }
}
```

### 2. Proteção de Dados
```typescript
@Injectable()
export class MobileDataProtectionService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
  ) {}

  async protectData(
    data: any,
    deviceId: string,
  ): Promise<ProtectedData> {
    const key = await this.generateEncryptionKey(deviceId);
    const encrypted = await this.encryptionService.encrypt(data, key);
    
    return {
      data: encrypted,
      keyHash: await this.hashKey(key),
      timestamp: new Date(),
    };
  }

  async unprotectData(
    protectedData: ProtectedData,
    deviceId: string,
  ): Promise<any> {
    const key = await this.retrieveEncryptionKey(deviceId);
    await this.validateKeyHash(key, protectedData.keyHash);
    
    return this.encryptionService.decrypt(protectedData.data, key);
  }
}
``` 