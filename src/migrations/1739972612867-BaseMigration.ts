import { MigrationInterface, QueryRunner } from "typeorm";

export class BaseMigration1739972612867 implements MigrationInterface {
    name = 'BaseMigration1739972612867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_847c3b57ab049376d3380329a9" ON "services" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_019d74f7abcdcb5a0113010cb0" ON "services" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f9dc5b3a2c915e0a7595f58eb" ON "services" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4ecb9ccd90c33095bc62d5305" ON "services" ("updated_at") `);
        await queryRunner.query(`CREATE TABLE "versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "service_id" uuid NOT NULL, CONSTRAINT "PK_921e9a820c96cc2cd7d4b3a107b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7b8f3c4e975124b73df370b7b2" ON "versions" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a96e4f0bbca29c7e3d5e7ae8ac" ON "versions" ("tenant_id", "service_id") `);
        await queryRunner.query(`ALTER TABLE "versions" ADD CONSTRAINT "fk_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "versions" DROP CONSTRAINT "fk_service_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a96e4f0bbca29c7e3d5e7ae8ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7b8f3c4e975124b73df370b7b2"`);
        await queryRunner.query(`DROP TABLE "versions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4ecb9ccd90c33095bc62d5305"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f9dc5b3a2c915e0a7595f58eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_019d74f7abcdcb5a0113010cb0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_847c3b57ab049376d3380329a9"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }

}
