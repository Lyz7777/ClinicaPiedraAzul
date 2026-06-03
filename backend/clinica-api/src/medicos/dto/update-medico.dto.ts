import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

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

export class UpdateMedicoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(ESPECIALIDADES_FISIOTERAPIA, { message: 'Especialidad no válida' })
  especialidad?: string;
}