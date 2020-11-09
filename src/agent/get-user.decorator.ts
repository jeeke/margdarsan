import {createParamDecorator, UnauthorizedException} from "@nestjs/common";
import {User} from "../entities/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

// export const GetUser = createParamDecorator(async (data, ctx): Promise<User> => {
//     return ctx.switchToHttp().getRequest().user;
// });
export const GetAgent = createParamDecorator(async (data, ctx): Promise<User> => {
    const user = ctx.switchToHttp().getRequest().user;
    if (user.user_type === UserType.Agent || user.user_type === UserType.Admin) return user;
    else throw new UnauthorizedException('Action not permitted');
});
export const GetStudent = createParamDecorator(async (data, ctx): Promise<User> => {
    const user = ctx.switchToHttp().getRequest().user;
    if (user.user_type === UserType.Student) return user;
    else throw new UnauthorizedException('Action not permitted');
});