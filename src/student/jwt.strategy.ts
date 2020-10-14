import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload, UserType } from "./jwt-payload.interface";
import * as config from "config";
import { Student } from "./student.entity";
import { Agent } from "../agent/agent.entity";

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
    const { username, phone, user_type } = payload;
    let user;
    if (user_type === UserType.Student && username) {
      user = await Student.findOne({ username });
    } else if (user_type === UserType.Agent && username) {
      user = await Agent.findOne({ username });
    } else if (user_type === UserType.Agent && phone) {
      user = { phone };
    } else throw new UnauthorizedException();

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}