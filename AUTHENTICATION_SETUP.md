# AIRMAN Academy+ Authentication Setup

## Overview
This application uses Supabase for authentication with comprehensive organization-based access control.

## Supported Authentication Methods
- **Email/Password**: Traditional login with password
- **Magic Link**: Passwordless login via email
- **Google OAuth**: Social login with Google
- **Microsoft OAuth**: Coming soon (UI ready, needs provider setup)
- **Apple OAuth**: Coming soon (UI ready, needs provider setup)

## Provider Setup

### Google OAuth
1. Go to [Supabase Dashboard > Authentication > Providers](https://supabase.com/dashboard/project/vmzlvvbvidhtvcgqarou/auth/providers)
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URLs in Google Cloud Console

### Microsoft & Apple OAuth
- UI is ready but providers need to be configured in Supabase dashboard
- Follow Supabase documentation for each provider setup

## Organization Access Control

### User Flow
1. **Sign Up**: User creates account with email confirmation
2. **Domain Check**: System checks if email domain matches organization
3. **Auto-Approval**: If `auto_approve_domain` is enabled for matching org
4. **Manual Approval**: If disabled, admin must approve pending requests
5. **Access Granted**: User gains access to organization features

### Admin Bootstrap (Development)
Use browser console commands to set up initial super admin:

```javascript
// Promote a user to super admin
await window.promoteToSuperAdmin(
  'admin@yourcompany.com',
  'Your Company Name', 
  'yourcompany.com'
);

// View current user info
await window.showCurrentUserInfo();
```

## Database Security
- **Row Level Security (RLS)** enabled on all tables
- **Admin-only access** for sensitive operations
- **User isolation** ensures users only see their organization's data
- **Event logging** for audit trails

## Development Features
- **DevUserInfo**: Shows current user role and status (dev mode only)
- **Admin Bootstrap**: Console utilities for initial setup
- **Centralized Error Handling**: Friendly error messages for auth issues

## Testing Scenarios

### QA Checklist
1. **Invited Email**: Send invite, verify auto-approval
2. **Domain Auto-Approve ON**: Register with matching domain
3. **Domain Auto-Approve OFF**: Register, verify pending status
4. **Non-matching Domain**: Register, verify pending status
5. **Protected Routes**: Verify no unauthenticated access possible
6. **Magic Link**: Test passwordless login flow
7. **Google OAuth**: Test social login (when configured)

## URL Configuration Required
Set these in [Supabase Auth Settings](https://supabase.com/dashboard/project/vmzlvvbvidhtvcgqarou/auth/providers):
- **Site URL**: Your application domain
- **Redirect URLs**: All valid redirect destinations

## Security Notes
- No phone/SMS OTP support (intentionally excluded)
- Email confirmation required for signup
- Magic links expire after configured time
- Admin actions logged to event_log table
- Client-side inserts blocked for sensitive tables