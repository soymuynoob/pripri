import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';

export interface RouteAttributes {
  id?: number;
  path?: string;
  name?:string;
}

export interface RoleRouteAttributes {
  id?: number;
  routeId?: number;
  roleId?: number;
}

export interface RouteModel extends Model<RouteAttributes>, RouteAttributes {}
export interface RoleRouteModel extends Model<RoleRouteAttributes>, RoleRouteAttributes {}

export class Route extends Model<RouteModel, RouteAttributes> {}
export class RoleRoute extends Model<RoleRouteModel, RoleRouteAttributes> {}

export type RouteStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): RouteModel;
};

export type RoleRouteStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): RoleRouteModel;
};

export function RouteFactory(sequelize: Sequelize): RouteStatic {
  return <RouteStatic>sequelize.define(
    'route',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      initialAutoIncrement: '1',
      tableName: 'routes',
      timestamps: false,
    }
  );
}

export function RoleRouteFactory(sequelize: Sequelize): RoleRouteStatic {
  return <RoleRouteStatic>sequelize.define(
    'role_route',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      routeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'routes',
          key: 'id',
        },
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      initialAutoIncrement: '1',
      tableName: 'role_routes',
      timestamps: false,
    }
  );
}
