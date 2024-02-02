import { URL } from 'url';
interface RequestDetails {
  ip: string | undefined;
  userAgent: string | undefined;
  platform: string | undefined;
}

export class UrlUtils {
  static constructFullUrl(req: Request, shortUrl: string): string {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    return `${protocol}://${host}/${shortUrl}`;
  }

  static isSameHost(req: Request, shortUrl: string): boolean {
    const host = req.headers['host'];
    const shortUrlObj = new URL(shortUrl);
    const shortUrlHost = shortUrlObj.hostname;
    return shortUrlHost === host;
  }

  static getRequestDetails(req: Request): RequestDetails {
    const ip = req.headers['x-forwarded-for'] || (req as any).ip;
    const userAgent = req.headers['user-agent'];
    let platform = req.headers['sec-ch-ua-platform'];
    if (platform != null) {
      platform = platform.replace(/"/g, '');
    }
    return {
      ip,
      userAgent,
      platform,
    };
  }
}
