# PostIt

## Summary

It is a web application where you can search objects or animals to buy them or create your own post.

## Features

As an unauthenticated user you can only search posts and create an account (or sign in with Google).

As an authenticated user you can:

- create, update and delete your posts
- add posts to your favorite post list
- discuss with other users about their posts
- update or delete your account

## Development

It is mainly built with Next.js and TypeScript.
I have used MongoDB for the database, tailwindcss for the CSS and [Pusher](https://pusher.com/) for the communications in real time between users.

The authentication is done with NextAuth.js.

The API is tested with [Postman](https://www.postman.com/serv-1/workspace/ce865b5f-f710-4be2-bd31-c9b7418d2f5f/collection/17584909-58b49bb0-3d94-4dd8-aa6f-2d8a75ca5f9c).

## Deployment

It is deployed on Vercel. Open [https://postid.vercel.app](https://postid.vercel.app) to play with.
