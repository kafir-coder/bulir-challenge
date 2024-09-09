import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIndexes1725899164789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX idx_service_name ON service (name);
        CREATE INDEX idx_service_description ON service (description);
        CREATE INDEX idx_service_fee ON service (fee);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
