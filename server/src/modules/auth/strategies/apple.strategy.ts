// ============================================================
// Belenay Mobilya - Apple Sign-In Stratejisi
// passport-apple kullanarak Apple ile kimlik doğrulama yapar.
// ============================================================

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '../enums/provider.enum';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private readonly configService: ConfigService) {
    super({
      // Apple Developer Portal'dan alınan Services ID
      clientID: configService.get<string>('APPLE_CLIENT_ID') ?? 'com.belenay.services',
      // Apple Developer Portal'dan alınan Team ID
      teamID: configService.get<string>('APPLE_TEAM_ID') ?? 'APPLE_TEAM_ID_PLACEHOLDER',
      // Apple Portal'dan indirilen Key ID
      keyID: configService.get<string>('APPLE_KEY_ID') ?? 'APPLE_KEY_ID_PLACEHOLDER',
      // İndirilen .p8 uzantılı private key içeriği (tek satır veya multiline)
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY')
        ? configService.get<string>('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n')
        : 'APPLE_PRIVATE_KEY_PLACEHOLDER',
      // Apple'ın yönlendireceği callback URL
      callbackURL: `${configService.get<string>('API_BASE_URL') ?? 'http://localhost:3001'}/api/auth/apple/callback`,
      scope: ['email', 'name'],
    });
  }

  /**
   * Apple doğrulama başarılı olduğunda çağrılır.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<void> {
    // Apple, kullanıcının profil bilgilerini (ad/soyad) sadece ilk girişte gönderir.
    // Sonraki girişlerde profile boş veya eksik gelebilir, idToken içinden sub/email çözülür.
    const oauthDto: OAuthCallbackDto = {
      provider: Provider.APPLE,
      providerId: profile.id || profile.sub,
      email: profile.email || '',
      name: profile.name
        ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
        : (profile.email ? profile.email.split('@')[0] : 'Apple User'),
      avatar: undefined,
    };

    done(null, oauthDto);
  }
}
