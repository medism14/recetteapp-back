import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Adresse email de l\'utilisateur',
        example: 'john.doe@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Mot de passe de l\'utilisateur',
        example: 'motDePasse123!'
    })
    password: string;

    @ApiProperty({
        description: 'Prénom de l\'utilisateur',
        example: 'John'
    })
    firstName: string;

    @ApiProperty({
        description: 'Nom de famille de l\'utilisateur',
        example: 'Doe'
    })
    lastName: string;
}