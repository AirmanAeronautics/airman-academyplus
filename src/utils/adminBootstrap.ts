import { supabase } from '@/integrations/supabase/client';

/**
 * Bootstrap function to promote a user to super_admin of an organization
 * This should only be used during initial setup or by developers
 */
export async function promoteToSuperAdmin(email: string, orgName: string, orgDomain: string) {
  try {
    // First, get the current user (must be authenticated)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Must be authenticated to perform admin operations');
    }

    console.log('🔧 Admin Bootstrap: Starting promotion process...');
    
    // Check if organization exists, create if not
    let { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('domain', orgDomain)
      .single();

    if (orgError && orgError.code === 'PGRST116') {
      // Organization doesn't exist, create it
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          domain: orgDomain
        })
        .select('id')
        .single();

      if (createOrgError) {
        console.error('❌ Failed to create organization:', createOrgError);
        throw createOrgError;
      }
      
      org = newOrg;
      console.log('✅ Created new organization:', orgName);
    } else if (orgError) {
      console.error('❌ Failed to fetch organization:', orgError);
      throw orgError;
    }

    if (!org) {
      throw new Error('Failed to get or create organization');
    }

    // Find the user profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('❌ User profile not found:', email);
      throw new Error(`User profile not found for email: ${email}`);
    }

    // Update the user's profile to super_admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        org_id: org.id,
        role: 'super_admin',
        status: 'active'
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Failed to update profile:', updateError);
      throw updateError;
    }

    // Create org_settings if they don't exist
    const { error: settingsError } = await supabase
      .from('org_settings')
      .upsert({
        org_id: org.id,
        auto_approve_domain: false
      }, {
        onConflict: 'org_id'
      });

    if (settingsError) {
      console.warn('⚠️ Failed to create org settings:', settingsError);
    }

    console.log('✅ Successfully promoted user to super_admin');
    console.log('📧 Email:', email);
    console.log('🏢 Organization:', orgName);
    console.log('🌐 Domain:', orgDomain);
    
    return {
      success: true,
      message: `Successfully promoted ${email} to super_admin of ${orgName}`
    };

  } catch (error: any) {
    console.error('❌ Admin bootstrap failed:', error);
    return {
      success: false,
      message: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Development helper to show current user info
 * Only works in development mode
 */
export async function showCurrentUserInfo() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('🚫 showCurrentUserInfo only available in development mode');
    return;
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ No authenticated user');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', user.id)
      .single();

    console.log('👤 Current User Info:');
    console.log('  Email:', user.email);
    console.log('  User ID:', user.id);
    
    if (profile) {
      console.log('  Profile ID:', profile.id);
      console.log('  Role:', profile.role);
      console.log('  Status:', profile.status);
      console.log('  Org ID:', profile.org_id);
      
      if (profile.organization) {
        console.log('  Organization:', profile.organization.name);
        console.log('  Domain:', profile.organization.domain);
      }
    } else {
      console.log('  ❌ No profile found');
    }

  } catch (error) {
    console.error('❌ Failed to get user info:', error);
  }
}

// Expose to window for development
if (process.env.NODE_ENV === 'development') {
  (window as any).promoteToSuperAdmin = promoteToSuperAdmin;
  (window as any).showCurrentUserInfo = showCurrentUserInfo;
  
  console.log('🔧 Admin Bootstrap Functions Available:');
  console.log('  window.promoteToSuperAdmin(email, orgName, orgDomain)');
  console.log('  window.showCurrentUserInfo()');
}