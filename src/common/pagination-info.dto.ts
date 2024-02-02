import { ApiProperty } from '@nestjs/swagger';

export class PaginationInfoDto {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;
}
