import { PaginationInfoDto } from './pagination-info.dto';

export class ApiResponse<T = any> {
  data: T;
  message: string;
  statusCode: number;
  errors?: any;
  paginationInfo?: PaginationInfoDto;

  constructor(
    data: T,
    message: string,
    statusCode: number,
    errors?: any,
    paginationInfo?: PaginationInfoDto,
  ) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.paginationInfo = paginationInfo;
  }
}
