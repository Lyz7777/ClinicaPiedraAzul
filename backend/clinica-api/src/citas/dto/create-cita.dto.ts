import { IsString, IsInt, IsPositive, IsOptional, Matches, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCitaDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha debe tener formato YYYY-MM-DD' })
  fecha!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Hora debe tener formato HH:MM' })
  hora!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pacienteId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  medicoId!: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsIn(['AGENDADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
  estado?: string;
}