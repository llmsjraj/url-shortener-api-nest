import { IsNotEmpty, Matches } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class NotEmptyParam {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @Matches(/^[^\s]+$/, {
    message: 'alias should not contain spaces',
  })
  alias: string;
}
