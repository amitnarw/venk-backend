'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games-active', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      gameId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      roomId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      scores: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
      },
      joinedAt: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
      },
      disconnectedAt: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
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
    await queryInterface.dropTable('games-active');
  }
};