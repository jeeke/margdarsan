import {INestApplication} from "@nestjs/common";
import {Database, Resource} from "admin-bro-typeorm";

import AdminBro from "admin-bro";

import * as AdminBroExpress from "admin-bro-expressjs";
import AgentResource from "./resources/agent.resource";
import StudentResource from "./resources/student.resource";
import TxnResource from "./resources/txn.resource";
import UserResource from "./resources/user.resource";
import DarshikaResource from "./resources/darshika.resource";
import {User} from "../entities/user.entity";
import * as bcrypt from "bcryptjs"
import {UserType} from "../auth/jwt-payload.interface";

export async function setupAdminPanel(app: INestApplication): Promise<void> {

    /**
     * Register TypeORM adapter for using
     */
    AdminBro.registerAdapter({Database, Resource});
    const adminBro = new AdminBro({
        resources: [AgentResource, StudentResource, TxnResource, UserResource, DarshikaResource],
        rootPath: "/admin"
    });

    // const router = AdminBroExpress.buildRouter(adminBro);
    const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
        authenticate: async (username, password) => {
            const user = await User.findOne({
                where: {
                    phone: username
                }
            })
            if (user && user.user_type === UserType.Admin) {
                const matched = await bcrypt.compare(password, user.admin_password)
                if (matched ) {
                    return user
                }
            }
            return false
        },
        cookiePassword: 'sgfdg#$*NDSU#*$(Q)@46w&q45$#34va$^)dsgv43',
    })
    app.use(adminBro.options.rootPath, router);

}