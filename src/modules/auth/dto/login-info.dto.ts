import { ApiProperty } from '@nestjs/swagger';

export class LoginInfoDto {
    @ApiProperty({
        description: 'Adresse email de l\'utilisateur',
        example: 'utilisateur@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Mot de passe de l\'utilisateur',
        example: 'motdepasse123'
    })
    password: string;
}