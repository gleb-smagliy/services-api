import { AppDataSource } from '../modules/database/data-source';
import { Service } from '../modules/services/entities/service.entity';
import { Version } from '../modules/services/entities/version.entity';

const tenantId = 'swagger_ui_tenant_id';

async function seed() {
  try {
    const dataSource = await AppDataSource.initialize();
    const serviceRepo = dataSource.getRepository(Service);
    const versionRepo = dataSource.getRepository(Version);

    await versionRepo.delete({
      tenantId,
    });
    await serviceRepo.delete({
      tenantId,
    });

    const services: Service[] = [];
    for (let i = 1; i <= 10; i++) {
      const service = serviceRepo.create({
        tenantId,
        name: `Service ${i}`,
        description: `Description for Service ${i}`,
      });
      await serviceRepo.save(service);
      services.push(service);
    }

    // Create 10 Version records (each version attaches to a Service)
    // Here we attach Version i to Service i. You can change the logic as needed.
    for (let i = 1; i <= 100; i++) {
      const version = versionRepo.create({
        tenantId,
        name: `Version ${i}`,
        description: `Description for Version ${i}`,
        service: services[(i - 1) % services.length],
      });
      await versionRepo.save(version);
    }

    console.log('Seeding successful!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
