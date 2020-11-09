import {ResourceWithOptions} from "admin-bro";
import {User} from "../../entities/user.entity";
import * as bcrypt from "bcryptjs"
import {UserType} from "../../auth/jwt-payload.interface";

const middleware = async (request) => {
    if (request.payload.admin_password && request.payload.user_type === UserType.Admin) {
        request.payload = {
            ...request.payload,
            admin_password: await bcrypt.hash(request.payload.admin_password, 10),
        }
    }
    return request
};
const UserResource: ResourceWithOptions = {
    resource: User,
    options: {
        listProperties: ['id', 'phone', 'user_type'],
        actions: {
            new: {
                before: middleware,
            },
            edit: {
                before: middleware,
            }
        }
    },
};

export default UserResource;