import { INestApplication } from "@nestjs/common";
import { Database, Resource } from "admin-bro-typeorm";

import AdminBro from "admin-bro";

import * as AdminBroExpress from "admin-bro-expressjs";
import AgentResource from "./resources/agent.resource";
import StudentResource from "./resources/student.resource";
import TxnResource from "./resources/txn.resource";

export async function setupAdminPanel(app: INestApplication): Promise<void> {

  /**
   * Register TypeORM adapter for using
   */
  AdminBro.registerAdapter({ Database, Resource });
  const adminBro = new AdminBro({
    resources: [AgentResource, StudentResource, TxnResource],
    rootPath: "/admin"
  });

  const router = AdminBroExpress.buildRouter(adminBro);
  app.use(adminBro.options.rootPath, router);

}