# imgbb Configuration

## Environment Variable Setup

To enable image uploads via imgbb, you need to configure your imgbb API key as an environment variable in your Convex deployment.

### Step 1: Get Your imgbb API Key

1. Go to [imgbb API page](https://api.imgbb.com/)
2. Click "Get API Key" (or sign up if you don't have an account)
3. Copy your API key

### Step 2: Add to Convex Environment

Run the following command to add the environment variable to your Convex deployment:

**For production (cloud deployment):**
```bash
npx convex env set IMGBB_API_KEY "your-imgbb-api-key-here" --prod
```

**For development (local):**
```bash
npx convex env set IMGBB_API_KEY "your-imgbb-api-key-here"
```

Replace `your-imgbb-api-key-here` with your actual imgbb API key.

### Step 3: Verify Configuration

After setting the environment variable, you can verify it was set correctly:

**For production:**
```bash
npx convex env list --prod
```

**For development:**
```bash
npx convex env list
```

You should see `IMGBB_API_KEY` in the list.

## Testing

Once configured, the POST `/receipt` endpoint will automatically use this API key to upload images to imgbb.

## imgbb Free Tier

The free tier includes:
- Unlimited image uploads
- No bandwidth limits
- Images hosted permanently
- Direct image URLs

## Security Notes

- Never commit your imgbb API key to version control
- The key is stored securely in Convex's environment and is only accessible to your backend functions
- Use separate API keys for development and production environments if needed

