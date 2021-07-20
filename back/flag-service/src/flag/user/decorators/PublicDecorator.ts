import { CustomDecorator } from "@nestjs/common/decorators/core/set-metadata.decorator";

export const Public = (redirect?: string): CustomDecorator => {
  throw new Error('Not implemented');
};
