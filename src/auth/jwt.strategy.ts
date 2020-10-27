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
        const {username, phone, user_type, initialized} = payload;
        let user;
        if (user_type !== UserType.Agent && user_type !== UserType.Student) throw new UnauthorizedException();
        if (username && initialized) {
            user = await User.findOne({username: username});
        } else if (phone && initialized === false) {
            user = new User();
        }
        if (!user) {
            throw new UnauthorizedException();
        }

        user.phone = phone;
        user.user_type = user_type;
        return user;
    }

}