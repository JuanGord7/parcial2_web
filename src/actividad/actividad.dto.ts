import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateActividadDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsInt()
  @Min(1)
  cupoMaximo: number;
}
