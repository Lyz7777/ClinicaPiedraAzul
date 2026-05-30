import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';

const ESPECIALIDADES = [
  'Medicina General','Pediatría','Cardiología','Dermatología','Psicología',
  'Fisioterapia','Ginecología','Oftalmología','Otorrinolaringología',
  'Traumatología','Neurología','Nutrición'
];

export class CreateMedicoDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  nombre!: string;

  @IsString()
  @IsIn(ESPECIALIDADES, { message: 'Especialidad no válida' })
  especialidad!: string;
}