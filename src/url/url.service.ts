import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './url.model';
import * as shortid from 'shortid';
import {
  ShortenedUrlRequestDto,
  ListUrlResponseDto,
  UpdateUrlDto,
  StatisticDto,
  PaginatedListUrlResponseDto,
} from './url.dto';
import { UrlUtils } from '../common/utils';
import { TooManyRequestsException } from 'src/common/exceptions/custom.exceptions';

@Injectable()
export class UrlService {
  constructor(@InjectModel(Url.name) private readonly urlModel: Model<Url>) {}

  async shortenUrl(
    createUrlDto: ShortenedUrlRequestDto,
    req: Request,
  ): Promise<Url> {
    const { originalUrl } = createUrlDto;

    if (UrlUtils.isSameHost(req, originalUrl)) {
      throw new BadRequestException('URL domain banned.');
    }

    const existingUrl = await this.urlModel.findOne({ originalUrl }).exec();
    if (existingUrl) {
      return existingUrl;
    }

    const shortId = shortid.generate();
    const url = new this.urlModel({
      originalUrl,
      alias: shortId,
      shortUrl: UrlUtils.constructFullUrl(req, shortId),
    });
    return await url.save();
  }

  async getOriginalUrl(alias: string, req: Request): Promise<string> {
    const url = await this.urlModel.findOne({ alias }).exec();
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (url.isDeleted) {
      throw new GoneException('Resource has been deleted');
    }

    if (url.requestLimit !== undefined) {
      if (url.statistics.length >= url.requestLimit) {
        throw new TooManyRequestsException('Request limit exceeded');
      }
    }

    const data = UrlUtils.getRequestDetails(req);
    const newStatistic = {
      _id: new Types.ObjectId(),
      accessedAt: new Date(),
      accessedFrom: data.ip,
      userAgent: data.userAgent,
      platform: data.platform,
    };

    url.statistics.push(newStatistic);
    await url.save();
    return url.originalUrl;
  }

  async getStatistics(alias: string): Promise<StatisticDto[]> {
    const url = await this.urlModel.findOne({ alias }).exec();
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (url.isDeleted) {
      throw new GoneException('Resource has been deleted');
    }

    const statisticsDtoArray = url.statistics.map((statistic) => ({
      id: statistic._id.toString(),
      accessedAt: statistic.accessedAt.toISOString(),
      accessedFrom: statistic.accessedFrom,
      userAgent: statistic.userAgent,
      platform: statistic.platform,
    }));

    return statisticsDtoArray;
  }

  async getAllUrls(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedListUrlResponseDto> {
    const skip = (page - 1) * pageSize;

    const [urls, total] = await Promise.all([
      this.urlModel
        .find({ isDeleted: { $ne: true } })
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.urlModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
    ]);

    if (urls.length === 0) {
      throw new NotFoundException('URL not found');
    }

    const responseDtoArray = urls.map((url) => {
      const listUrlResponseDto = new ListUrlResponseDto();
      listUrlResponseDto.id = url._id.toString();
      listUrlResponseDto.originalUrl = url.originalUrl;
      listUrlResponseDto.shortUrl = url.shortUrl;
      listUrlResponseDto.alias = url.alias;
      listUrlResponseDto.requestLimit = url.requestLimit;
      listUrlResponseDto.statistics = url.statistics.map((statistic) => ({
        id: statistic._id.toString(),
        accessedAt: statistic.accessedAt.toISOString(),
        accessedFrom: statistic.accessedFrom,
        userAgent: statistic.userAgent,
        platform: statistic.platform,
      }));
      return listUrlResponseDto;
    });

    // Create pagination metadata
    const paginationInfo = {
      totalItems: total,
      itemsPerPage: pageSize,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };

    return { data: responseDtoArray, paginationInfo };
  }

  async updateUrl(alias: string, updateUrlDto: UpdateUrlDto): Promise<Url> {
    const url = await this.urlModel.findOne({ alias }).exec();
    if (!url) {
      throw new NotFoundException('Alias not found');
    }

    if (url.isDeleted) {
      throw new GoneException('Resource has been deleted');
    }

    if (updateUrlDto.alias && updateUrlDto.alias !== url.alias) {
      const existingUrlWithAlias = await this.urlModel
        .findOne({
          alias: updateUrlDto.alias,
        })
        .exec();

      if (existingUrlWithAlias) {
        throw new ConflictException('Alias is already taken');
      }

      url.alias = updateUrlDto.alias;
    }

    if (updateUrlDto.requestLimit) {
      url.requestLimit = updateUrlDto.requestLimit;
    }

    return await url.save();
  }

  async deleteUrl(alias: string): Promise<void> {
    const url = await this.urlModel.findOne({ alias }).exec();
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    url.isDeleted = true;
    await url.save();
  }
}
