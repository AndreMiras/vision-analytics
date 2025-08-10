# Bitpanda Vision Analytics

[![Tests](https://github.com/AndreMiras/vision-analytics/actions/workflows/tests.yml/badge.svg)](https://github.com/AndreMiras/vision-analytics/actions/workflows/tests.yml)

Extract & chart [Bitpanda Vision](http://vision.now) token yield analytics using
The Graph Protocol.

<https://bitpanda-vision-analytics.vercel.app>

<img src="https://i.imgur.com/EHbYC2B.png" alt="Screenshot">

## Features

- Real-time exchange rate tracking
- Historical APY calculations
- Interactive time period selection

## Links

- [Dashboard](https://bitpanda-vision-analytics.vercel.app)
- [Subgraph](https://thegraph.com/explorer/subgraphs/AFHGugzAJbgBSRvNnjEx4c1Wya5M4oMAWa5RsNnjQCrs)
- [Subgraph Repository](https://github.com/AndreMiras/bitpanda-subgraphs)

## Install

```sh
npm ci
```

## Development

```sh
# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000)
