import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'users', underscored: true })
export default class UserModel extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;
}
