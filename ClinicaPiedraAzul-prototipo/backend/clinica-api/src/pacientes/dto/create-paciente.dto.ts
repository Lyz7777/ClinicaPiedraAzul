import { IsString, IsOptional, IsEmail, IsIn, IsNotEmpty, Matches } from 'class-validator';

export class CreatePacienteDto {
  @IsNotEmpty({ message: 'El documento de identidad es obligatorio' })
  @IsString()
  @Matches(/\S/, { message: 'El documento de identidad es obligatorio' })
  documento!: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @Matches(/\S/, { message: 'El nombre es obligatorio' })
  nombres!: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  @Matches(/\S/, { message: 'El apellido es obligatorio' })
  apellidos!: string;

  @IsNotEmpty({ message: 'El celular es obligatorio' })
  @IsString()
  @Matches(/\S/, { message: 'El celular es obligatorio' })
  celular!: string;

  @IsNotEmpty({ message: 'El género es obligatorio' })
  @IsIn(['Hombre', 'Mujer', 'Otro'])
  genero!: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}