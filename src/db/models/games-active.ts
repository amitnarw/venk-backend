'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const GamesActive = sequelize.define('games-active', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER
  },
  gameId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  scores: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  disconnectedAt: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
}, {
  modelName: 'games-active',
  timestamps: true,
});

export default GamesActive;
