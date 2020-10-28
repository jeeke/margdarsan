import {ResourceWithOptions} from "admin-bro";
import {User} from "../../auth/user.entity";
import * as bcrypt from "bcryptjs"

const middleware = async (request) => {
    if (request.payload.phone) {
        if(request.payload.is_admin) {
            request.payload = {
                ...request.payload,
                phone: await bcrypt.hash(request.payload.phone, 10),
            }
        }
    }
    return request
};
const UserResource: ResourceWithOptions = {
    resource: User,
    options: {
        listProperties: ['id', 'username', 'phone', 'name'],
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