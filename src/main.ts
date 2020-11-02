import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as config from "config";
import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import { setupAdminPanel } from "./admin/admin.plugin";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const serverConfig = config.get("server");
  const logger = new Logger("bootstrap");
  const app = await NestFactory.create(AppModule);
  await setupAdminPanel(app);

  if(process.env.NODE_ENV === 'development'){
      const options = new DocumentBuilder()
          .setTitle("MargDarshan")
          .setDescription("MargDarshan REST API description")
          .setVersion("1.0")
          .build();
      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup("api/docs", app, document);
  }

  const firebaseConfig = config.get("firebase");
  const adminConfig: ServiceAccount = {
    projectId: firebaseConfig.projectId,
    privateKey: firebaseConfig.privateKey,
    // .replace(/\\n/g, '\n'),
    clientEmail: firebaseConfig.clientEmail
  };
  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: firebaseConfig.databaseURL
  });
  app.enableCors();
  // if (process.env.NODE_ENV === "development") {
  //   app.enableCors();
  // } else {
  //   app.enableCors({ origin: serverConfig.origin });
  //   logger.log(`Accepting requests from origin "${serverConfig.origin}"`);
  // }
  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
