# URL Shortener Backend

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
NODE_PORT=8080
NODE_ENV=development

DB_PORT=3306
DB_USER=root
DB_HOST=127.0.0.1
DB_DATABASE=pensionbox_local_qa
DB_PASSWORD=
DB_DIALECT=mysql
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```


post - /:url -> return shortended url, save redirectUrl & shortenUrl
get - /:url -> return redirected url
analytics/url -> return url analytics {hitCount, all data}
