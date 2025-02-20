import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLengthLimitToTextFields1740031499869
  implements MigrationInterface
{
  name = 'AddLengthLimitToTextFields1740031499869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "tenant_id" TYPE character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "name" TYPE character varying(256)`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "description" TYPE character varying(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "versions" ALTER COLUMN "tenant_id" TYPE character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "versions" ALTER COLUMN "name" TYPE character varying(256)`,
    );
    await queryRunner.query(
      `ALTER TABLE "versions" ALTER COLUMN "description" TYPE character varying(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "versions" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
