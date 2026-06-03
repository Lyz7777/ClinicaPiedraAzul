import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class MarcarAsistenciaDto {
  @IsBoolean()
  asistio!: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['QR', 'DOCUMENTO', 'MANUAL'])
  metodo?: string;
}