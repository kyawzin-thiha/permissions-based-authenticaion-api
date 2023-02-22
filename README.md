# Permission Based Authentication system using Nest.js

This is a permission based authentication system using [Nest.js](https://docs.nestjs.com) with [Prisma.io](http://prisma.io) (ORM). In this API, users will be able to create custom roles using 4 permissions (read, write, delete, admin).

## **Services Used**

- Prisma ([MongoDb](https://www.mongodb.com) Database)
- [SendGrid](https://sendgrid.com)
- JWT Token ([@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt))
- [AWS S3](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Categories=categories%23storage&trk=777b3ec4-de01-41fb-aa63-cde3d034a89e&sc_channel=ps&s_kwcid=AL!4422!3!638364429346!e!!g!!aws%20s3&ef_id=CjwKCAiAl9efBhAkEiwA4Torim_xfKHCkojlYc_SpWn2Y9Z8mxI_wnNUKDDC6G-dxMCf-NhwbTQpBRoCVOUQAvD_BwE:G:s&s_kwcid=AL!4422!3!638364429346!e!!g!!aws%20s3&awsf.Free%20Tier%20Types=*all)
- [Redis](https://redis.com)

## Install

```bash
npm install
```

## Run the app in development

```bash
npm run build:prisma
npm run start:dev
```

## Build the app in production

```bash
npm run build 
npm run start:prod
```

## Required variables

**SendGrid variables**

- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- EMAIL_VERIFICATION_TEMPLATE_ID
- RESET_PASSWORD_TEMPLATE_ID

**AWS variables**

- AWS_REGION
- AWS_BUCKET
- AWS_S3_DOMAIN
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_FOLDER_PATH

**Redis variable**

- REDIS_URL

**Database variable**

- DATABASE_URL

**System variables**

- CLIENT_URL
- WEB_URL (Frontend URL for sendgrid email-verification and reset-password)
- COOKIE_SECRET
- JWT_SECRET
- PORT
