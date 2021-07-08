import { Module } from '@nestjs/common';
import { PixelRepository } from "./repository";

@Module({
    imports: [],
    controllers: [],
    providers: [PixelRepository],
    exports:[PixelRepository],
})
export class PixelModule {}
