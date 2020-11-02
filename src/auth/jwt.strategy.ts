import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtPayload, UserType} from "./jwt-payload.interface";
import * as config from "config";
import {User} from "./user.entity";

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

    async validate(payload: JwtPayload): Promise<any> {
        const {phone, user_type, initialized} = payload;
        let user;
        if (user_type !== UserType.Agent && user_type !== UserType.Student) throw new UnauthorizedException();
        if (phone && initialized) {
            user = await User.findOne({
                where: {
                    phone: phone
                }
            })
        } else if (phone) {
            user = new User();
            user.phone = phone;
        }
        if (!user) {
            throw new UnauthorizedException();
        }

        user.user_type = user_type;
        return user;
    }

}