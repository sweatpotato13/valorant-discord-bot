import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id!: number;

    @Column("text", { name: "user_id", unique: true })
    userId!: string;

    @Column("text", { name: "account" })
    account!: string;

    @Column("text", { name: "password" })
    password!: string;

    @Column("text", { name: "region" })
    region!: string;

    @Column("text", { name: "puuid", nullable: true })
    puuid?: string;

    @Column("boolean", { name: "has2fa" })
    has2fa!: boolean;

    @Column("text", { name: "cookie", nullable: true })
    cookie?: string;

    @Column("text", { name: "headers", nullable: true })
    headers?: string;
}
