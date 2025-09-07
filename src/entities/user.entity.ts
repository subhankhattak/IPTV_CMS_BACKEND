import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ApplicationAssignment } from "./application-assignment.entity";
import { UserTypeEnum } from "../users/enums/userType.enum";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_name", nullable: false })
  user_name: string;

  @Column({ name: "phone_number", unique: true, nullable: false })
  phone_number: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ 
    name: "user_type", 
    type: "enum", 
    enum: UserTypeEnum, 
    default: UserTypeEnum.USER 
  })
  user_type: UserTypeEnum;

  @Column({ default: true })
  active: boolean;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  // Relationships
  @OneToMany(() => ApplicationAssignment, (assignment) => assignment.reseller)
  application_assignments: ApplicationAssignment[];
}
