import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVersionsIndexing1740065467904 implements MigrationInterface {
    name = 'UpdateVersionsIndexing1740065467904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a96e4f0bbca29c7e3d5e7ae8ac"`);
        await queryRunner.query(`CREATE INDEX "IDX_961b0fd5ea2634e21a6ef6faed" ON "versions" ("service_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_961b0fd5ea2634e21a6ef6faed"`);
        await queryRunner.query(`CREATE INDEX "IDX_a96e4f0bbca29c7e3d5e7ae8ac" ON "versions" ("service_id", "tenant_id") `);
    }

}
