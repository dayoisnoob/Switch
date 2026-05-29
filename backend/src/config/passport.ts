import passport from 'passport';
import {
  Strategy as GitHubStrategy,
  type Profile as GitHubProfile,
} from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { OAuthProfileInput } from '../types/auth.types';
import { env } from './env';
import type { Request } from 'express';

interface GitHubEmail {
  value: string;
  primary?: boolean;
  verified?: boolean;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: true,
    },
    async (req, _accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (!email)
        return done(new Error('No email returned from Google'), false);

      const userProfile: OAuthProfileInput = {
        email,
        firstName:
          profile.name?.givenName ||
          profile.displayName.split(' ')[0] ||
          'User',
        lastName:
          profile.name?.familyName || profile.displayName.split(' ')[1] || '',
        avatarUrl: profile.photos?.[0]?.value || null,
        authProvider: 'google',
        providerId: profile.id,
        inviteToken: (req.query.state as string) || undefined,
      };

      return done(null, userProfile);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
      passReqToCallback: true,
    },
    (
      req: Request,
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: (error: any, user?: any) => void
    ) => {
      const githubEmails = profile.emails as GitHubEmail[] | undefined;
      const email =
        githubEmails?.find((e) => e.primary && e.verified)?.value ||
        githubEmails?.[0]?.value;

      if (!email)
        return done(new Error('No email returned from GitHub.'), false);

      const displayName = profile.displayName || profile.username || '';
      const [firstName, ...rest] = displayName.split(' ');

      const userProfile: OAuthProfileInput = {
        email,
        firstName: firstName || profile.username || 'User',
        lastName: rest.join(' ') || '',
        avatarUrl: profile.photos?.[0]?.value || null,
        authProvider: 'github',
        providerId: String(profile.id),
        inviteToken: (req.query.state as string) || undefined,
      };
      return done(null, userProfile);
    }
  )
);

export default passport;
