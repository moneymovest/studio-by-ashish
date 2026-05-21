This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Quick Setup (Add your API keys)

1. Copy the example env file and add your Supabase keys:

```bash
cp .env.example .env.local
# then edit .env.local and paste your keys
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

The app is resilient when env keys are not present — pages will render with helpful notices. When you add your keys and rebuild/deploy, the site will fetch live Supabase data.

## Deploy & Connect Domain

1. Deploy to Vercel (recommended) or your preferred host. If using Vercel, add the same env vars in the Project Settings → Environment Variables.

2. When you connect your domain to this project (after disconnecting it from the previous project), point the domain in Vercel's dashboard to this deployment. Once DNS updates propagate, your site will be live and fetch live data from Supabase.

Notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` secret — only set it in server environment variables (not in the client/browser).
- If you want the site to show data immediately during dev without Supabase, tell me and I can add a local fallback dataset.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
