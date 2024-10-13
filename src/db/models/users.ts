'use strict';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbConnect';
import { UserAttributes } from 'types/common';

const Users = sequelize.define<Model<UserAttributes>>('users', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
            is: {
                args: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                msg: 'Invalid email address format'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: {
                args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                msg: 'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            }
        }
    },
    loginType: {
        type: DataTypes.ENUM('email', 'password', 'phone'),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    dob: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refreshToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    modelName: 'users',
    timestamps: true,
});

export default Users;
