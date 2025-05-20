import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateResenaDto {
  @IsString()
  @IsNotEmpty()
  comentario: string;

  @IsInt()
  @Min(1)
  @Max(5)
  calificacion: number;

  @IsString()
  @IsNotEmpty()
  fecha: string;
}
