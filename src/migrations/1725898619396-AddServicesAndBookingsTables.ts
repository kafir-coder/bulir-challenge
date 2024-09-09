import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddServicesAndBookingsTables1725898619396
  implements MigrationInterface
{
  name = 'AddServicesAndBookingsTables1725898619396'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text NOT NULL, "fee" numeric NOT NULL, "serviceProviderId" uuid, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "service_booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bookingDate" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "clientId" uuid, "serviceId" uuid, "serviceProviderId" uuid, CONSTRAINT "PK_9d09944bb5f60931975225747da" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_0d428b99abd863110a478fdfa54" FOREIGN KEY ("serviceProviderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "service_booking" ADD CONSTRAINT "FK_990d3fcc3bc21d38211f9ce9d22" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "service_booking" ADD CONSTRAINT "FK_a254515f07d3a054d9da0ca485b" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "service_booking" ADD CONSTRAINT "FK_75aa5743c2caa4871971851e6a5" FOREIGN KEY ("serviceProviderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_booking" DROP CONSTRAINT "FK_75aa5743c2caa4871971851e6a5"`,
    )
    await queryRunner.query(
      `ALTER TABLE "service_booking" DROP CONSTRAINT "FK_a254515f07d3a054d9da0ca485b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "service_booking" DROP CONSTRAINT "FK_990d3fcc3bc21d38211f9ce9d22"`,
    )
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_0d428b99abd863110a478fdfa54"`,
    )
    await queryRunner.query(`DROP TABLE "service_booking"`)
    await queryRunner.query(`DROP TABLE "service"`)
  }
}
