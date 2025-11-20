import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OnboardingResult {
  success: boolean;
  profile?: any;
  error?: string;
  needsApproval?: boolean;
}

/**
 * Robust, idempotent onboarding function
 * Ensures user has proper profile and org assignment after authentication
 */
export async function ensureProfileAndOrg(session: Session): Promise<OnboardingResult> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, error: 'Invalid session data' };
  }

  // Log onboarding attempt
  await logOnboardingEvent('onboarding_start', {
    user_id: session.user.id,
    email: session.user.email
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await performOnboardingAttempt(session);
      
      if (result.success) {
        await logOnboardingEvent('onboarding_success', {
          user_id: session.user.id,
          email: session.user.email,
          attempt,
          profile_created: true
        });
        return result;
      }
      
      // If it's the last attempt, return the error
      if (attempt === maxRetries) {
        await logOnboardingEvent('onboarding_failed', {
          user_id: session.user.id,
          email: session.user.email,
          attempts: maxRetries,
          error: result.error
        });
        return result;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt === maxRetries) {
        await logOnboardingEvent('onboarding_exception', {
          user_id: session.user.id,
          email: session.user.email,
          attempts: maxRetries,
          error: errorMessage
        });
        
        return { 
          success: false, 
          error: `Onboarding failed after ${maxRetries} attempts: ${errorMessage}` 
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  return { success: false, error: 'Maximum retry attempts exceeded' };
}

/**
 * Performs a single onboarding attempt
 */
async function performOnboardingAttempt(session: Session): Promise<OnboardingResult> {
  const { user } = session;
  const userEmail = user.email!;
  const userDomain = userEmail.split('@')[1];
  const userName = user.user_metadata?.full_name || user.user_metadata?.name;

  // First, check if profile already exists and is properly set up
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *, 
      organizations(name, domain),
      user_roles(role, org_id, assigned_at, is_active)
    `)
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Profile check failed: ${profileError.message}`);
  }

  // If profile exists and has org_id, we're done
  if (existingProfile?.org_id && existingProfile.role !== 'pending') {
    return { 
      success: true, 
      profile: existingProfile,
      needsApproval: false
    };
  }

  // Check if this is the first user (no admins exist)
  const { data: adminCount, error: adminError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .in('role', ['admin', 'super_admin']);

  if (adminError) {
    throw new Error(`Admin check failed: ${adminError.message}`);
  }

  let targetOrgId: string;
  let targetRole: string;
  let needsApproval = false;

  if ((adminCount as any) === 0) {
    // First user - create default org and make admin
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: 'AIRMAN Academy (Demo)',
        domain: userDomain,
        is_default: true
      }])
      .select()
      .single();

    if (orgError) {
      throw new Error(`Failed to create default organization: ${orgError.message}`);
    }

    targetOrgId = newOrg.id;
    targetRole = 'admin';

    // Create org settings with auto-approve enabled
    await supabase
      .from('org_settings')
      .insert([{
        org_id: targetOrgId,
        auto_approve_domain: true
      }]);

  } else {
    // Check for explicit invite
    const { data: invite, error: inviteError } = await supabase
      .from('org_invites')
      .select('*')
      .eq('email', userEmail)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError && inviteError.code !== 'PGRST116') {
      throw new Error(`Invite check failed: ${inviteError.message}`);
    }

    if (invite) {
      // Use invite
      targetOrgId = invite.org_id;
      targetRole = invite.role;

      // Mark invite as used
      await supabase
        .from('org_invites')
        .update({ used: true })
        .eq('id', invite.id);

    } else {
      // Check for domain-based auto-approval
      const { data: orgWithSettings, error: orgError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          domain,
          org_settings(auto_approve_domain)
        `)
        .eq('domain', userDomain)
        .single();

      if (orgError && orgError.code !== 'PGRST116') {
        throw new Error(`Organization check failed: ${orgError.message}`);
      }

      const autoApprove = orgWithSettings?.org_settings?.[0]?.auto_approve_domain;

      if (orgWithSettings && autoApprove) {
        // Auto-approve by domain
        targetOrgId = orgWithSettings.id;
        targetRole = 'user';
      } else {
        // Get default org or use domain-matched org for pending request
        const { data: defaultOrg, error: defaultOrgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('is_default', true)
          .single();

        if (defaultOrgError) {
          throw new Error(`Default organization not found: ${defaultOrgError.message}`);
        }

        targetOrgId = orgWithSettings?.id || defaultOrg.id;
        targetRole = 'pending';
        needsApproval = true;

        // Create pending request
        await supabase
          .from('org_pending_requests')
          .insert([{
            user_id: user.id,
            email: userEmail,
            org_id: targetOrgId,
            status: 'pending'
          }]);
      }
    }
  }

  // Create or update profile
  const { data: profile, error: upsertError } = await supabase
    .from('profiles')
    .upsert([{
      id: user.id,
      email: userEmail,
      name: userName,
      org_id: targetOrgId,
      role: targetRole
    }], {
      onConflict: 'id',
      ignoreDuplicates: false
    })
    .select(`
      *, 
      organizations(name, domain),
      user_roles(role, org_id, assigned_at, is_active)
    `)
    .single();

  if (upsertError) {
    throw new Error(`Profile upsert failed: ${upsertError.message}`);
  }

  // Send welcome notification
  const notificationMessage = needsApproval 
    ? 'Your account is pending approval. You\'ll be notified once approved.'
    : 'Your account has been activated and you can now access the platform.';

  await supabase
    .from('notifications')
    .insert([{
      user_id: user.id,
      title: 'Welcome to AIRMAN Academy+!',
      message: notificationMessage,
      type: needsApproval ? 'info' : 'success',
      org_id: targetOrgId
    }]);

  return { 
    success: true, 
    profile,
    needsApproval
  };
}

/**
 * Logs onboarding events for debugging and audit trail
 */
async function logOnboardingEvent(type: string, metadata: any): Promise<void> {
  try {
    await supabase
      .from('event_log')
      .insert([{
        type,
        category: 'auth',
        message: `Onboarding: ${type}`,
        metadata,
        user_id: metadata.user_id,
        org_id: metadata.org_id || null
      }]);
  } catch (error) {
    // Don't throw - logging failures shouldn't break onboarding
    console.warn('Failed to log onboarding event:', error);
  }
}

/**
 * Shows appropriate user feedback based on onboarding result
 */
export function handleOnboardingResult(result: OnboardingResult): void {
  if (result.success) {
    if (result.needsApproval) {
      toast({
        title: "Account Pending Approval",
        description: "Your account has been created and is awaiting approval from an administrator.",
        variant: "default"
      });
    } else {
      toast({
        title: "Welcome!",
        description: "Your account has been successfully set up.",
        variant: "default"
      });
    }
  } else {
    toast({
      title: "Setup Error",
      description: result.error || "There was an issue setting up your account. Please try again.",
      variant: "destructive"
    });
  }
}