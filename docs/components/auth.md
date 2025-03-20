# Authentication System

## Magic Links

The Stufio Admin supports authentication via magic links, which allows users to log in without entering a password.

### How It Works

1. User requests a magic link by providing their email address
2. System generates a secure, time-limited token
3. Token is sent to the user's email
4. User clicks the link in their email, which includes the token as a query parameter
5. The application automatically validates the token and logs the user in

### Implementation

Magic links are implemented using the following components:

- **TokenValidator**: Automatically detects and processes authentication tokens in the URL
- **Auth Store**: Contains methods for validating tokens and authenticating users
- **API Endpoints**: Backend endpoints handle token verification and user authentication

### Magic Link Format

Magic login links follow this format:
```
https://admin.yourdomain.com/?magic=JWT_TOKEN
```

Where `JWT_TOKEN` is a signed JWT containing user identification and expiration information.

### Email Verification

The same token system is used for email verification, with a different token format:
```
https://admin.yourdomain.com/?token=VERIFICATION_TOKEN
```

### Security Considerations

- Tokens are cryptographically signed to prevent tampering
- Tokens include expiration times (typically 15-30 minutes)
- Tokens are single-use and invalidated after use
- Magic link authentication maintains the same security standards as password-based authentication

## Usage in Code

```typescript
// Request a magic link
async function sendMagicLink(email: string) {
  try {
    const { data } = await useApi(`/api/v1/login/magic/${encodeURIComponent(email)}`, {
      method: 'POST'
    });
    return data.value?.msg || 'Magic link sent';
  } catch (error) {
    console.error('Failed to send magic link:', error);
    throw error;
  }
}

// The TokenValidator component automatically handles the rest
```