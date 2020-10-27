import {ResourceWithOptions} from "admin-bro";
import {User} from "../../auth/user.entity";

const UserResource: ResourceWithOptions = {
    resource: User,
    options: {listProperties: ['username','phone', 'name']},
};

export default UserResource;