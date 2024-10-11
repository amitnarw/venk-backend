'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const UserTransactions = sequelize.define('user-transactions', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
  },
  effect: {
    type: DataTypes.ENUM('add', 'subtract'),
    allowNull: false,
  },
}, {
  modelName: 'user-transactions',
  timestamps: true,
});

export default UserTransactions;
