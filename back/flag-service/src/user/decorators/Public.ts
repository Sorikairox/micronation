import { CustomDecorator, SetMetadata } from "@nestjs/common/decorators/core/set-metadata.decorator";

export const Public = (): CustomDecorator => SetMetadata('public', true);
