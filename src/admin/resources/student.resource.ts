import {ResourceWithOptions} from 'admin-bro';
import {Student} from "../../entities/student.entity";
import tagStringToTagHandler from "./hooks";

const StudentResource: ResourceWithOptions = {
    resource: Student,
    options: {
        properties: {
            'tags': {
                type: "string"
            },
            'subscription_txn': {
                isVisible: false,
            },
            'name': {
                isTitle: true
            }
        },
        actions: {
            new: {
                isVisible: false,
            },
            delete: {
                isVisible: false,
            },
            edit: {
                before: tagStringToTagHandler
            },
            show: {
                after: async (request, data) => {
                    const s = await Student.findOne(request.record.id)
                    request.record.params.tags = s.tags.map(t => t.tag).join(',')
                    return request
                }
            }
        }
    },
};

export default StudentResource;
