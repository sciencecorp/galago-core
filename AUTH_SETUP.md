# Authentication Setup for Galago

This document provides instructions on how to set up authentication for the Galago application, which now supports multiple authentication methods including:

1. Traditional username/password
2. Google OAuth
3. GitHub OAuth

## Prerequisites

- Node.js v18.13 or higher
- Python 3.9 or higher
- PostgreSQL database

## Initial Setup

1. Install the required dependencies:

```bash
cd controller
npm install next-auth@4.24.5 @next-auth/prisma-adapter
```

2. Create a `.env.local` file in the `controller` directory with the following content (replace placeholder values with your actual configuration):

```
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth Secret (generate a secure random value)
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3010

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Custom auth integration keys 
JWT_SECRET_KEY=your-jwt-secret-key
API_KEY_SECRET=your-api-key-encryption-secret
```

3. Update the database environment variables:

```bash
cd ..
echo "JWT_SECRET_KEY=your-jwt-secret-key" >> .env
echo "API_KEY_SECRET=your-api-key-encryption-secret" >> .env
```

## Setting Up OAuth Providers

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add `http://localhost:3010` as an authorized JavaScript origin
7. Add `http://localhost:3010/api/auth/callback/google` as an authorized redirect URI
8. Copy the Client ID and Client Secret to your `.env.local` file

### GitHub OAuth

1. Go to your [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Galago
   - Homepage URL: `http://localhost:3010`
   - Authorization callback URL: `http://localhost:3010/api/auth/callback/github`
4. Click "Register application"
5. Generate a new client secret
6. Copy the Client ID and Client Secret to your `.env.local` file

## Creating an Admin User

If you need to create an admin user manually via a script, you would typically create a script that interacts with your database to insert a new user with admin privileges. Ensure this script securely handles passwords (e.g., hashing).

Example (conceptual - adapt to your specific database and user model):
```python
# db/create_admin.py (Conceptual - adapt to your setup)
# from your_user_model import User, hash_password
# from your_database_session import db_session

# username = input("Enter admin username: ")
# email = input("Enter admin email: ")
# password = input("Enter admin password: ")

# hashed_password = hash_password(password)

# admin_user = User(username=username, email=email, password=hashed_password, is_admin=True)
# db_session.add(admin_user)
# db_session.commit()
# print(f"Admin user {username} created successfully.")
```

To run such a script:
```bash
python db/create_admin.py 
```
Follow the interactive prompts to create your admin user.

## Testing Authentication

1. Start the development server:

```bash
cd controller
npm run dev
```

2. Open a browser and navigate to `http://localhost:3010/auth/signin`
3. Test each authentication method:
   - Username/password login (if you have created users)
   - Google or GitHub login (if configured)

## Troubleshooting

### OAuth Authentication

- Check that your redirect URIs exactly match what's in your provider settings
- Verify that your client IDs and secrets are correctly copied to your `.env.local` file
- For production, update the callback URLs to use your production domain

### General Authentication Issues

- Check that your NEXTAUTH_SECRET is set and is the same across deployments
- Verify that your database is properly set up with the user tables
- Check browser console and server logs for error messages

## Security Considerations

- Always use HTTPS in production
- Rotate your JWT and API secrets periodically
- Set appropriate token expiration times
- Use environment variables for all sensitive configuration
- Never commit .env files to version control 