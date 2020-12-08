import {ResourceWithOptions} from 'admin-bro';
import {Tag} from "../../entities/tag.entity";
const TagResource: ResourceWithOptions = {
    resource: Tag,
    options: {
        properties: {
            'tag': {
                isId: true,
                isTitle: true
            }
        }
    },
};

export default TagResource;
