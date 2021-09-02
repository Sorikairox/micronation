import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InvalidDirectusTokenError } from "../errors/InvalidDirectusTokenError";
import { Reflector } from "@nestjs/core";
import { Directus } from "@directus/sdk";
import { MissingDirectusTokenError } from "../errors/MissingDirectusTokenError";

@Injectable()
export class FouloscopieAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {
  }


  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization;
    const publicMetadata = this.reflector.get('public', context.getHandler());

    if (publicMetadata) {
      return true;
    } else if (!token) {
      throw new MissingDirectusTokenError();
    } else if (!await new Directus(process.env.DIRECTUS_URL).auth.static(token)) {
      throw new InvalidDirectusTokenError();
    }

    return true;
  }
}
