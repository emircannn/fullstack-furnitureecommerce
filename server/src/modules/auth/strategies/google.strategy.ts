// ============================================================
// Belenay Mobilya - Google OAuth2 Stratejisi
// passport-google-oauth20 kullanarak Google ile kimlik
// doğrulama yapar. Callback'te kullanıcı profili alınır
// ve sistem kullanıcısına dönüştürülür.
// ============================================================

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '../enums/provider.enum';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      // Google Cloud Console'dan alınan Client ID
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? 'GOOGLE_CLIENT_ID_PLACEHOLDER',
      // Google Cloud Console'dan alınan Client Secret
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') ?? 'GOOGLE_CLIENT_SECRET_PLACEHOLDER',
      // Google'ın yönlendireceği callback URL
      callbackURL: `${configService.get<string>('API_BASE_URL') ?? 'http://localhost:3001'}/api/auth/google/callback`,
      // İstenilen kullanıcı bilgileri kapsamı
      scope: ['email', 'profile'],
      // Profil bilgilerini her seferinde taze al
      prompt: 'select_account',
    });
  }

  /**
   * Google doğrulama başarılı olduğunda çağrılır.
   * Profil bilgilerini OAuthCallbackDto formatına dönüştürür.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    // Google profilinden kullanıcı bilgilerini çıkar
    const oauthDto: OAuthCallbackDto = {
      // OAuth sağlayıcısı
      provider: Provider.GOOGLE,
      // Google'ın benzersiz kullanıcı kimliği
      providerId: id,
      // Birincil e-posta adresi
      email: emails?.[0]?.value ?? '',
      // Tam ad (ad + soyad birleştir)
      name: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim() || profile.displayName,
      // Profil fotoğrafı URL
      avatar: photos?.[0]?.value,
    };

    // Passport'a kullanıcı bilgilerini ilet
    done(null, oauthDto);
  }
}
