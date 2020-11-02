import {Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {
    }

    @Get('api')
    getHello() {
        return {message: "Welcome to Margdarsan API!"}
    }
}