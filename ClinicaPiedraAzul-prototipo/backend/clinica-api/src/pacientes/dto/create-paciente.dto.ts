import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  documento!: string;

  @IsString()
  nombres!: string;

  @IsString()
  apellidos!: string;

  @IsString()
  celular!: string;

  @IsIn(['Hombre', 'Mujer', 'Otro'])
  genero!: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}