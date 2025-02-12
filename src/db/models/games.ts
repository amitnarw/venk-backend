'use strict';
import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect';

const Games = sequelize.define('games', {
  id: {
    allowNull: false,
    autoIncrement: true,
    unique: true,
    type: DataTypes.INTEGER
  },
  gameId: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalSlots: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bets: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  }
}, {
  modelName: 'games',
  timestamps: true,
});

export default Games;
