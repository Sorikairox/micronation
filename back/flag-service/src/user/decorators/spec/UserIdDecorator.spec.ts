import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { getUserIdFromCtx } from '../UserIdDecorator';

describe('UserIdDecorator', () => {
   describe('getUserIdFromCtx', () => {
        it ('returns userId', () => {
            const fakectx = { switchToHttp(): HttpArgumentsHost {
                    return {
                        getRequest<T = any>(): T {
                            return {
                                userId: 'fakeUserId'
                            } as any;
                        }
                    } as any;
                } } as any;
           expect(getUserIdFromCtx(fakectx)).toEqual('fakeUserId');
        });
   })
});
