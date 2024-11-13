'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      gameId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      roomId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      userIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      scores: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },
      joinedAt: {
        type: Sequelize.ARRAY(Sequelize.DATE),
        allowNull: false,
      },
      disconnectedAt: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "finished"),
        allowNull: false,
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      aiPlay: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      winnerUserId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rooms');
  }
};