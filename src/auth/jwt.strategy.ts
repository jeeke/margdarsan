import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtPayload, UserType} from "./jwt-payload.interface";
import * as config from "config";
import {User} from "../entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        // @InjectRepository(StudentRepository)
        // private studentRepository: StudentRepository,
        // @InjectRepository(AgentRepository)
        // private agentRepository: AgentRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || config.get("jwt.secret")
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const {phone, user_type, initialized} = payload;
        let user;
        if (phone && initialized) {
            user = await User.findOne({
                where: {
                    phone: phone
                }
            })
        } else if (phone) {
            user = new User();
            user.phone = phone;
            user.user_type = user_type;
        }
        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }

}