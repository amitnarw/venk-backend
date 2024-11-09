import UserPaymentMethods from "./payment-methods";
import UserTransactions from "./user-transactions";
import Users from "./users";
import Games from "./games";
import Rooms from "./rooms";
import AdminControl from "./admin-control";

Games.hasMany(Rooms, { foreignKey: 'gameId', sourceKey: "gameId" });
Rooms.belongsTo(Games, { foreignKey: 'gameId' });

export { Users, UserPaymentMethods, UserTransactions, Rooms, Games, AdminControl }