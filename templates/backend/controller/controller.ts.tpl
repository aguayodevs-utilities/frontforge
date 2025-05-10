import { NextFunction, Request, Response } from "express";
import { GenericToken } from "${RelativePathGenericToken}";
import { ${FeatureCamel}Service } from "${RelativePathService}";

export class ${FeatureCamel}Controller {
${ControllerConstructor}
    
  private getToken(): string | undefined {
    return this.req.headers.authorization?.split(' ')[1];
  }

${ControllerMethod}
}
