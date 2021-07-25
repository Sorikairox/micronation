import { CustomDecorator, SetMetadata } from "@nestjs/common/decorators/core/set-metadata.decorator";

export const Public = (redirect?: string): CustomDecorator => SetMetadata('public', { redirect });
