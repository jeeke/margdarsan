import {ResourceWithOptions} from "admin-bro";
import {Darshika} from "../../entities/darshika.entity";
import tagStringToTagHandler from "./hooks";

const DarshikaResource: ResourceWithOptions = {
    resource: Darshika,
    options: {
        properties: {
            'tags': {
                type: "string"
            },
        },
        actions: {
            new: {
                before: tagStringToTagHandler
            },
            edit: {
                before: tagStringToTagHandler
            },
            show: {
                after: async (request, data) => {
                    const s = await Darshika.findOne(request.record.id)
                    request.record.params.tags = s.tags.map(t => t.tag).join(',')
                    return request
                }
            }
        }
    },
};

export default DarshikaResource;
