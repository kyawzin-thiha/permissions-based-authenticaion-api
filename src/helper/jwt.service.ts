import { Injectable } from '@nestjs/common';
import { JwtService  } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) { }
    
    sign(payload: any, expiresIn = "1d") {
        return this.jwtService.sign(payload, {
            expiresIn,
        });
       
    }

    verify(token: string) : {userId: string, uniqueKey: string} {
            const data = this.jwtService.verify(token);
            return data;
    }
}