import {ResourceWithOptions} from "admin-bro";
import {User} from "../../auth/user.entity";
import {Darshika} from "../../student/darshika.entity";

const DarshikaResource: ResourceWithOptions = {
    resource: Darshika,
    options: {},
};

export default DarshikaResource;