'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const Rooms = sequelize.define('rooms', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  gameId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("waiting", "active", "finished"),
    allowNull: false,
  },
}, {
  modelName: 'rooms',
  timestamps: true,
});

export default Rooms;
