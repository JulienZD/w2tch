# W2tch

A simple app to create and share watchlists with your friends.

## Stack
- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Development
Requirements:
- pnpm
- Docker

Clone the repo and install dependencies:
```bash
pnpm install
```
Setup your environment variables
```bash
cp .env.example .env
```

Start a local database with Docker
```bash
docker-compose up -d
```
Start the development server
```bash
pnpm dev
```

## Credits
This project was built with the [T3 Stack](https://create.t3.gg/).
