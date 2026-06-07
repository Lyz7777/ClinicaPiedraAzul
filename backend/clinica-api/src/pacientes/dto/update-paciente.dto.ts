import { IsString, IsOptional, IsEmail, IsIn, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdatePacienteDto {
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'El documento debe tener al menos 4 caracteres' })
  @MaxLength(20, { message: 'El documento no puede superar 20 caracteres' })
  @Matches(/^[A-Za-z0-9]+$/, { message: 'El documento solo puede contener letras y números' })
  documento?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(80)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(80)
  apellidos?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{7,15}$/, { message: 'El celular debe tener entre 7 y 15 dígitos' })
  celular?: string;

  @IsOptional()
  @IsIn(['Hombre', 'Mujer', 'Otro'], { message: 'Género debe ser Hombre, Mujer u Otro' })
  genero?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha de nacimiento debe tener formato YYYY-MM-DD' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  auth0Id?: string;
}