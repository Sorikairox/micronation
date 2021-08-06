import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function registerAndLogin(app: INestApplication, email: string, password: string, nickname: string): Promise<string> {
    await request(app.getHttpServer())
        .post('/user/register')
        .send({
            email: email,
            password: password,
            passwordConfirmation: password,
            nickname: nickname,
        });
    const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({
            email: email,
            password: password,
        });
    return res.body.jwt;
}
