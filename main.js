"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const config = require("config");
const admin = require("firebase-admin");
const admin_plugin_1 = require("./admin/admin.plugin");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const serverConfig = config.get("server");
    const logger = new common_1.Logger("bootstrap");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await admin_plugin_1.setupAdminPanel(app);
    const options = new swagger_1.DocumentBuilder()
        .setTitle("MargDarshan")
        .setDescription("MargDarshan REST API description")
        .setVersion("1.0")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup("api", app, document);
    const firebaseConfig = config.get("firebase");
    const adminConfig = {
        projectId: firebaseConfig.projectId,
        privateKey: firebaseConfig.privateKey,
        clientEmail: firebaseConfig.clientEmail
    };
    admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
        databaseURL: firebaseConfig.databaseURL
    });
    if (process.env.NODE_ENV === "development") {
        app.enableCors();
    }
    else {
        app.enableCors({ origin: serverConfig.origin });
        logger.log(`Accepting requests from origin "${serverConfig.origin}"`);
    }
    const port = process.env.PORT || serverConfig.port;
    await app.listen(port);
    logger.log(`Application listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map