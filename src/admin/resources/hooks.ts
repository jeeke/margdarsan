import {Tag} from "../../entities/tag.entity";
import {In} from "typeorm/index";
import {NotFoundException} from "@nestjs/common";

const tagStringToTagHandler = async (request) => {
    if (request.payload.tags) {
        const {tags, ...other} = request.payload
        const tagsArray = tags.split(',')
        const tags1 = await Tag.find({
            where: {
                tag: In(tagsArray)
            }
        })
        if (tagsArray.length !== tags1.length) {
            throw new NotFoundException("Some tags not found")
        } else request.payload = {
            tags: tags1,
            ...other
        }
    }
    return request;
}

export default tagStringToTagHandler;

