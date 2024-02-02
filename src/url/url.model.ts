import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Url extends Document {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true })
  shortUrl: string;

  @Prop({ required: true })
  alias: string;

  @Prop()
  requestLimit: number;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({
    type: [
      {
        _id: Types.ObjectId,
        accessedAt: { type: Date, default: Date.now },
        accessedFrom: String,
        userAgent: String,
        platform: String,
      },
    ],
  })
  statistics: {
    _id: Types.ObjectId;
    accessedAt: Date;
    accessedFrom: string;
    userAgent: string;
    platform: string;
  }[];
}

export const UrlSchema = SchemaFactory.createForClass(Url);
