import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id?: number;

    @Column("text", { name: "name" })
    name?: string;

    @Column("text", { name: "description", nullable: true })
    description?: string;
}
