import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cats')
export class CatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column()
  age: number;
}
