# PostIt

PostIt is a web application to post ads to sell something.
Inspired by [Leboncoin](https://www.leboncoin.fr), made for practice.

## Features

- Search for something to buy
- Create, update or delete your account
- Create, update or delete your ads
- Add ads to your favorite list
- Discuss with other users about their ads (define trade place, negociate the price, etc...)

## Technologies Used

Next.js, TypeScript, MongoDB (with Mongoose), TailwindCSS

- For authentication: NextAuth.js
- For real-time messaging in secure e2e encrypted channels: Pusher
- For storing images: AWS S3

Tested with Vitest and React Testing Library.

## Getting Started

The app is deployed on Vercel: [https://postit-site.vercel.app](https://postit-site.vercel.app). You can search for fridge, table or chair to see how it looks.

Or you can run it locally:

1. Clone the repository
2. Install dependencies using `npm install`
3. Create a .env.local file in the root directory and add your environment variables
4. Run `npm run dev` to start the development server
