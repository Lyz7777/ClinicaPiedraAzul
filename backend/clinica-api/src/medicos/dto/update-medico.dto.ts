import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

const ESPECIALIDADES = [
  'Médico/Terapista',
  'Fisioterapeuta',
  'Quiropráctico'
];

export class UpdateMedicoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(ESPECIALIDADES, { message: 'Especialidad no válida' })
  especialidad?: string;
}