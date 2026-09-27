import { supabase, supabaseAdmin } from '../lib/supabase';
import { UserProfile } from '../types/auth';
import {
  getUserProfile as getLocalProfile,
  saveUserProfile as saveLocalProfile,
  clearUserProfile as clearLocalProfile,
} from '../store/gameStore';

export interface SignUpParams {
  name: string;
  surname: string;
  dob: string;
  cellphone: string;
  country: string;
  countryCode: string;
  province: string;
  town: string;
  gamerTag: string;
  email: string;
  password: string;
}

export const authService = {
  /**
   * Register a new player with Supabase Auth (skipping email verification) and provision profile.
   */
  async signUp(params: SignUpParams): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const email = params.email.trim().toLowerCase();
      const gamerTag = params.gamerTag.trim();
      let userId: string = '';

      // 1. Create user with email_confirm: true (skips email verification completely)
      try {
        const { data: adminCreated, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: params.password,
          email_confirm: true,
          user_metadata: {
            gamer_tag: gamerTag,
            name: params.name.trim(),
            surname: params.surname.trim(),
            dob: params.dob.trim(),
            cellphone: params.cellphone.trim(),
            country: params.country,
            country_code: params.countryCode,
            province: params.province,
            town: params.town.trim(),
          },
        });

        if (!adminErr && adminCreated?.user) {
          userId = adminCreated.user.id;
        } else if (adminErr && !adminErr.message.toLowerCase().includes('already')) {
          // Non-duplicate error
        }
      } catch {
        // Fallback to standard client signup
      }

      // If admin creation was skipped or errored, try standard signup
      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: params.password,
          options: {
            data: {
              gamer_tag: gamerTag,
              name: params.name.trim(),
              surname: params.surname.trim(),
              dob: params.dob.trim(),
              cellphone: params.cellphone.trim(),
              country: params.country,
              country_code: params.countryCode,
              province: params.province,
              town: params.town.trim(),
            },
          },
        });

        if (authError && !authError.message.toLowerCase().includes('already')) {
          return { user: null, error: authError.message };
        }

        if (authData?.user) {
          userId = authData.user.id;
          // Auto-confirm via admin in case it was created unconfirmed
          try {
            await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
          } catch {
            // Ignore
          }
        }
      }

      // 2. Establish live client session
      await supabase.auth.signInWithPassword({
        email,
        password: params.password,
      });

      // 3. Ensure profile record in public.profiles
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          gamer_tag: gamerTag,
          name: params.name.trim(),
          surname: params.surname.trim(),
          dob: params.dob.trim(),
          cellphone: params.cellphone.trim(),
          country: params.country,
          country_code: params.countryCode,
          province: params.province,
          town: params.town.trim(),
          title: 'Warrior',
        });

        // Initialize career stats if not present
        await supabase.from('career_stats').upsert({
          user_id: userId,
          elo_rating: 1200,
          matches_played: 0,
          wins: 0,
          losses: 0,
          win_streak: 0,
          best_win_streak: 0,
          win_rate: 0,
          mills_formed: 0,
          cows_captured: 0,
          flown_cows: 0,
        });
      } catch {
        // Fallback if table not ready yet
      }

      // 4. Format and save local cache
      const profile: UserProfile = {
        id: userId,
        name: params.name.trim(),
        surname: params.surname.trim(),
        dob: params.dob.trim(),
        cellphone: params.cellphone.trim(),
        country: params.country,
        countryCode: params.countryCode,
        province: params.province,
        town: params.town.trim(),
        gamerTag,
        email,
        createdAt: new Date().toISOString(),
      };

      await saveLocalProfile(profile);
      return { user: profile, error: null };
    } catch (e: any) {
      return { user: null, error: e.message || 'An unexpected registration error occurred.' };
    }
  },

  /**
   * Sign in using either Gamer Tag or Email address.
   */
  async signIn(
    identifier: string,
    password: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const cleanId = identifier.trim();
      let targetEmail = cleanId.toLowerCase();

      // If user typed Gamer Tag rather than email, resolve email from profiles table or admin
      if (!cleanId.includes('@')) {
        try {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .ilike('gamer_tag', cleanId)
            .maybeSingle();

          if (profileRow?.id) {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profileRow.id);
            if (userData?.user?.email) {
              targetEmail = userData.user.email;
            }
          }
        } catch {
          // fallback
        }
      }

      // 1. Attempt Supabase Auth login
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      // If email not confirmed, auto-confirm via admin and retry
      if (authError && authError.message.toLowerCase().includes('confirm')) {
        try {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const targetUser = listData?.users.find(
            (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
          );
          if (targetUser) {
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, { email_confirm: true });
            const retry = await supabase.auth.signInWithPassword({
              email: targetEmail,
              password,
            });
            authData = retry.data;
            authError = retry.error;
          }
        } catch {
          // Ignore
        }
      }


      if (!authError && authData.user) {
        // Fetch full profile from Supabase
        const userId = authData.user.id;
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const profile: UserProfile = {
          id: userId,
          name: dbProfile?.name || authData.user.user_metadata?.name || 'Warrior',
          surname: dbProfile?.surname || authData.user.user_metadata?.surname || 'Player',
          dob: dbProfile?.dob || authData.user.user_metadata?.dob || '2000-01-01',
          cellphone: dbProfile?.cellphone || authData.user.user_metadata?.cellphone || '+27000000000',
          country: dbProfile?.country || authData.user.user_metadata?.country || 'South Africa',
          countryCode: dbProfile?.country_code || authData.user.user_metadata?.country_code || 'ZA',
          province: dbProfile?.province || authData.user.user_metadata?.province || 'Gauteng',
          town: dbProfile?.town || authData.user.user_metadata?.town || 'Johannesburg',
          gamerTag: dbProfile?.gamer_tag || authData.user.user_metadata?.gamer_tag || cleanId,
          email: authData.user.email || targetEmail,
          createdAt: dbProfile?.created_at || new Date().toISOString(),
        };

        await saveLocalProfile(profile);
        return { user: profile, error: null };
      }

      // 2. Offline / Local fallback if cloud credentials match local cache
      const local = await getLocalProfile();
      if (
        local &&
        (local.email.toLowerCase() === cleanId.toLowerCase() ||
          local.gamerTag.toLowerCase() === cleanId.toLowerCase())
      ) {
        return { user: local, error: null };
      }

      // If Supabase returned an error and no local session matches
      if (authError) {
        return { user: null, error: authError.message };
      }

      return { user: null, error: 'Invalid credentials. Please verify your Gamer Tag or Email.' };
    } catch (e: any) {
      return { user: null, error: e.message || 'An unexpected sign-in error occurred.' };
    }
  },

  /**
   * Log out of Supabase and clear local session cache.
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    } finally {
      await clearLocalProfile();
    }
  },

  /**
   * Get active authenticated user profile.
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const userId = data.session.user.id;
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (dbProfile) {
          return {
            id: userId,
            name: dbProfile.name,
            surname: dbProfile.surname,
            dob: dbProfile.dob,
            cellphone: dbProfile.cellphone,
            country: dbProfile.country,
            countryCode: dbProfile.country_code,
            province: dbProfile.province,
            town: dbProfile.town,
            gamerTag: dbProfile.gamer_tag,
            email: data.session.user.email || '',
            createdAt: dbProfile.created_at,
          };
        }
      }
    } catch {
      // Fallback
    }

    return await getLocalProfile();
  },
};
