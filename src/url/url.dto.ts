import { IsUrl, IsString, IsOptional, IsInt } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationInfoDto } from 'src/common/pagination-info.dto';

export class ShortenedUrlRequestDto {
  @ApiProperty({ description: 'Original URL', example: 'https://example.com' })
  @IsUrl()
  originalUrl: string;
}

export class ShortenUrlResponseDto {
  @ApiProperty({
    description: 'Shortened URL',
    example: 'https://short.ly/abc123',
  })
  shortUrl: string;
}

export class StatisticDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  accessedAt: string;

  @ApiProperty()
  accessedFrom: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  platform: string;
}

export class ListUrlResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'https://example.com' })
  originalUrl: string;

  @ApiProperty({ example: 'http://localhost:3000/XKsPpGIX8' })
  shortUrl: string;

  @ApiProperty({ example: 'XKsPpGIX8' })
  alias: string;

  @ApiProperty({ example: 100 })
  requestLimit: number;

  @ApiProperty({ type: [StatisticDto] })
  statistics: StatisticDto[];
}

export class PaginatedListUrlResponseDto {
  @ApiProperty()
  data: ListUrlResponseDto[];

  @ApiProperty()
  paginationInfo: PaginationInfoDto;
}

export class UpdateUrlDto {
  @ApiProperty({
    description: 'Custom alias (optional)',
    example: 'my-updated-url',
    required: false,
  })
  @IsString()
  @IsOptional()
  alias?: string;

  @ApiProperty({
    description: 'Request limit (optional)',
    example: 50,
    required: false,
  })
  @IsInt()
  @IsOptional()
  requestLimit?: number;
}

export class UpdateUrlResponseDto {
  @ApiProperty({
    description: 'Shortened URL',
    example: 'https://short.ly/updated-abc123',
  })
  shortUrl: string;

  @ApiProperty({ description: 'Original URL', example: 'https://example.com' })
  originalUrl: string;

  @ApiProperty({
    description: 'Custom alias (optional)',
    example: 'my-updated-url',
    required: false,
  })
  alias?: string;

  @ApiProperty({
    description: 'Request limit (optional)',
    example: 50,
    required: false,
  })
  requestLimit?: number;
}
