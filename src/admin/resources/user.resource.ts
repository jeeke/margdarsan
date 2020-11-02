import {ResourceWithOptions} from "admin-bro";
import {User} from "../../auth/user.entity";
import * as bcrypt from "bcryptjs"

const middleware = async (request) => {
    if (request.payload.admin_password && request.payload.is_admin) {
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
        listProperties: ['id', 'phone', 'is_admin'],
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