import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

const ESPECIALIDADES = [
  'Medicina General','Pediatría','Cardiología','Dermatología','Psicología',
  'Fisioterapia','Ginecología','Oftalmología','Otorrinolaringología',
  'Traumatología','Neurología','Nutrición'
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