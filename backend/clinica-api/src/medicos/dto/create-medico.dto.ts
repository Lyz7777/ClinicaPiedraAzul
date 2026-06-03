import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';

const ESPECIALIDADES_FISIOTERAPIA = [
  'Fisioterapia Deportiva',
  'Fisioterapia Neurológica',
  'Fisioterapia Ortopédica y Traumatológica',
  'Fisioterapia Pediátrica',
  'Fisioterapia Geriátrica',
  'Fisioterapia Respiratoria',
  'Fisioterapia Cardiovascular',
  'Fisioterapia Uroginecológica y Obstétrica',
  'Fisioterapia Oncológica'
];

export class CreateMedicoDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  nombre!: string;

  @IsString()
  @IsIn(ESPECIALIDADES_FISIOTERAPIA, { message: 'Especialidad no válida' })
  especialidad!: string;
}