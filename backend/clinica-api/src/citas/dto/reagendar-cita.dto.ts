import { IsString, Matches } from 'class-validator';

export class ReagendarCitaDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha debe tener formato YYYY-MM-DD' })
  fecha!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Hora debe tener formato HH:MM' })
  hora!: string;
}