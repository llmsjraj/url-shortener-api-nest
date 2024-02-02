import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpCode,
  Logger,
  InternalServerErrorException,
  Req,
  GoneException,
  Query,
} from '@nestjs/common';
import { UrlService } from './url.service';
import {
  ShortenedUrlRequestDto,
  ListUrlResponseDto,
  ShortenUrlResponseDto,
  StatisticDto,
  UpdateUrlDto,
  UpdateUrlResponseDto,
  PaginatedListUrlResponseDto,
} from './url.dto';
import { ApiResponse } from '../common/api-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiGoneResponse,
  ApiConflictResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { TooManyRequestsException } from 'src/common/exceptions/custom.exceptions';
import { NotEmptyParam } from 'src/common/not-empty-param.dto';

@ApiTags('urls')
@Controller('url')
export class UrlController {
  private readonly logger = new Logger(UrlController.name);

  constructor(private readonly urlService: UrlService) {}

  @ApiOperation({ summary: 'Shorten URL' })
  @ApiCreatedResponse({
    description: 'URL successfully shortened',
    type: ApiResponse<ShortenUrlResponseDto>,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid data provided',
    type: ApiResponse<BadRequestException>,
  })
  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  async shortenUrl(
    @Req()
    req: Request,
    @Body()
    createUrlDto: ShortenedUrlRequestDto,
  ): Promise<ApiResponse<ShortenUrlResponseDto>> {
    try {
      const url = await this.urlService.shortenUrl(createUrlDto, req);
      this.logger.log('URL successfully shortened');
      return new ApiResponse(
        {
          shortUrl: url.shortUrl,
        },
        'URL successfully shortened',
        HttpStatus.CREATED,
      );
    } catch (error) {
      return this.handleErrorResponse<ShortenUrlResponseDto>(
        error,
        'An error occurred during URL shortening.',
      );
    }
  }

  @ApiOperation({ summary: 'Get All URLs' })
  @ApiOkResponse({
    description: 'All URLs retrieved',
    type: ApiResponse<Array<ListUrlResponseDto>>,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - URL not found',
    type: ApiResponse<NotFoundException>,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: ApiResponse<InternalServerErrorException>,
  })
  @Get('list')
  async getAllUrls(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<ApiResponse<PaginatedListUrlResponseDto>> {
    try {
      const urls = await this.urlService.getAllUrls(page, pageSize);
      return new ApiResponse(urls, 'All URLs retrieved', HttpStatus.OK);
    } catch (error) {
      return this.handleErrorResponse(
        error,
        'An error occurred while fetching all URLs.',
      );
    }
  }

  @ApiOperation({ summary: 'Get Original URL' })
  @ApiOkResponse({
    description: 'Returning original URL',
    type: ApiResponse<ShortenedUrlRequestDto>,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - URL not found',
    type: ApiResponse<NotFoundException>,
  })
  @ApiGoneResponse({
    description: 'Resource has been deleted',
    type: ApiResponse<GoneException>,
  })
  @ApiTooManyRequestsResponse({
    description: 'Request limit exceeded',
    type: ApiResponse<TooManyRequestsException>,
  })
  @Get(':alias')
  async getOriginalUrl(
    @Req()
    req: Request,
    @Param() params: NotEmptyParam,
  ): Promise<ApiResponse<ShortenedUrlRequestDto>> {
    try {
      const originalUrl = await this.urlService.getOriginalUrl(
        params.alias,
        req,
      );
      return new ApiResponse({ originalUrl }, 'Data returned', HttpStatus.OK);
    } catch (error) {
      return this.handleErrorResponse(
        error,
        'An error occurred during URL fetch.',
      );
    }
  }

  @ApiOperation({ summary: 'Get URL Statistics' })
  @ApiOkResponse({
    description: 'URL statistics retrieved',
    type: ApiResponse<StatisticDto>,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - URL not found',
    type: ApiResponse<NotFoundException>,
  })
  @ApiGoneResponse({
    description: 'Resource has been deleted',
    type: ApiResponse<GoneException>,
  })
  @Get('stats/:alias')
  async getStatistics(
    @Param() params: NotEmptyParam,
  ): Promise<ApiResponse<StatisticDto[]>> {
    try {
      const statistics = await this.urlService.getStatistics(params.alias);
      return new ApiResponse(
        statistics,
        'URL statistics retrieved',
        HttpStatus.OK,
      );
    } catch (error) {
      return this.handleErrorResponse(
        error,
        'An error occurred while fetching URL statistics.',
      );
    }
  }

  @ApiOperation({ summary: 'Update URL' })
  @ApiOkResponse({
    description: 'URL updated',
    type: ApiResponse<UpdateUrlResponseDto>,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Alias not found',
    type: ApiResponse<NotFoundException>,
  })
  @ApiGoneResponse({
    description: 'Resource has been deleted',
    type: ApiResponse<GoneException>,
  })
  @ApiConflictResponse({
    description: 'Alias is already taken',
    type: ApiResponse<ConflictException>,
  })
  @Patch(':alias')
  async updateUrl(
    @Param() params: NotEmptyParam,
    @Body() updateUrlDto: UpdateUrlDto,
  ): Promise<ApiResponse<UpdateUrlResponseDto>> {
    try {
      const updatedUrl = await this.urlService.updateUrl(
        params.alias,
        updateUrlDto,
      );
      const responseDto: UpdateUrlResponseDto = {
        shortUrl: updatedUrl.shortUrl,
        originalUrl: updatedUrl.originalUrl,
        alias: updatedUrl.alias,
        requestLimit: updatedUrl.requestLimit,
      };
      return new ApiResponse(responseDto, 'URL updated', HttpStatus.OK);
    } catch (error) {
      return this.handleErrorResponse(
        error,
        'An error occurred while updating the URL.',
      );
    }
  }

  @ApiOperation({ summary: 'Delete URL' })
  @ApiOkResponse({
    description: 'URL deleted',
    type: ApiResponse<void>,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - URL not found',
    type: ApiResponse<NotFoundException>,
  })
  @Delete(':alias')
  async deleteUrl(@Param() params: NotEmptyParam): Promise<ApiResponse<void>> {
    try {
      await this.urlService.deleteUrl(params.alias);
      return new ApiResponse(null, 'URL deleted', HttpStatus.OK);
    } catch (error) {
      return this.handleErrorResponse(
        error,
        'An error occurred while deleting the URL.',
      );
    }
  }

  async handleErrorResponse<T>(
    error: any,
    defaultMessage: string,
  ): Promise<ApiResponse<T>> {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(
        new ApiResponse(null, 'URL not found', HttpStatus.NOT_FOUND),
      );
    } else if (error instanceof ConflictException) {
      throw new ConflictException(
        new ApiResponse(null, error.message, HttpStatus.CONFLICT),
      );
    } else if (error instanceof BadRequestException) {
      throw new BadRequestException(
        new ApiResponse(null, error.message, HttpStatus.BAD_REQUEST),
      );
    } else if (error instanceof GoneException) {
      throw new GoneException(
        new ApiResponse(null, error.message, HttpStatus.GONE),
      );
    } else if (error instanceof TooManyRequestsException) {
      throw new TooManyRequestsException(
        new ApiResponse(null, error.message, HttpStatus.TOO_MANY_REQUESTS),
      );
    } else {
      this.logger.error(
        `Unexpected error during URL processing: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        new ApiResponse(null, defaultMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }
}
