import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): { message } {
        return {message: "Welcome to dezArt API"};
    }
}