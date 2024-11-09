'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const AdminControl = sequelize.define('admin-controls', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER
  },
  maintenanceMode: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  timeoutTime: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  modelName: 'admin-controls',
  timestamps: true,
});

export default AdminControl;
