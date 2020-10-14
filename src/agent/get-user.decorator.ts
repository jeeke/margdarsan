import { createParamDecorator, UnauthorizedException } from "@nestjs/common";
import * as admin from "firebase-admin";
import { Agent } from "./agent.entity";

export const GetUser = createParamDecorator(async (data, ctx): Promise<Agent> => {
  return ctx.switchToHttp().getRequest().user;
});