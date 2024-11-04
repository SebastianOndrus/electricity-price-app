# Electricity Price Application

An interactive application built using Next.js, TypeScript, and TailwindCSS, this project provides real-time electricity prices across different regions. Users can filter, search, and view price details for selected regions, along with daily highs/lows and hourly averages. This application fetches data from the Energy Charts API and presents it in a responsive and user-friendly interface.

Watch [showcase video](https://youtu.be/ADnPR82toPshttps://yourvideo-link.com) to see the app in action!

### Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Used API](#api)
- [Setup & Installation](#setup--installation)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Docker Deployment](#docker-deployment)

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Data Fetching**: React Query
- **Component Library**: shadcn UI
- **Charting**: Recharts (shadcn UI uses Recharts internally)
- **Containerization**: Docker

## Features

1. **Overview Page**: Displays a searchable, filterable, sortable list of regions with current electricity prices.
   - Search by region name or code.
   - Sort by name or price, in ascending or descending order.
   - Set a custom price range.
2. **Detail Page**: Provides detailed price data for a selected region, with tabs for various data types:
   - **Daily Prices**: View hourly electricity prices for a specific day.
   - **High/Low/Average Prices**: See daily highs, lows, and averages over a selected date range.
   - **Hourly Averages**: Shows average prices by hour of a day across a custom date range.
3. **Responsive Design**: Ensures the app looks great and functions smoothly on both desktop and mobile devices.
4. **Docker Support**: Run the application in a Docker container for easier deployment and environment consistency.

## API

This application retrieves electricity price data from the [Energy Charts API](https://api.energy-charts.info/).. Data is proxied through a Next.js API route (`/api/proxy-price`) to handle CORS issues and provide custom filtering and error handling.
- **Endpoint**: `/api/proxy-price`
- **Parameters**:
  - `bzn` (required): The bidding zone or region code (e.g., `DE-LU` for Germany and Luxembourg).
  - `start` (optional): Start date for the data range in `YYYY-MM-DD` format.
  - `end` (optional): End date for the data range in `YYYY-MM-DD` format.
- **Data Returned**: Prices by hour, with the following structure:
  - `price`: Array of prices (EUR/MWh) for each hour.
  - `unix_seconds`: Timestamps for each hourly price.
  - `unit`: Unit of the price values (usually EUR/MWh).
  - `license_info`: Information about licensing.
  - `deprecated`: Flag indicating if the data is deprecated.

## Setup & Installation

### Prerequisites
- **Node.js** (v14 or higher recommended)
- **Docker** (optional, if deploying with Docker)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SebastianOndrus/electricity-price-app.git
   cd electricity-price-app
   ```
2. **Install dependencies**:
   ```bash
    npm install
    ```
3. **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.
4. **Build the application**:
    ```bash
    npm run build
    npm start
    ```

### Usage
- **Overview Page**: Browse regions with the latest electricity prices. Use the search bar, filters, and sorting options to narrow down your results.
- **Detail Page**: Click on a region to view detailed data. Use tabs to switch between daily prices, high/low/average, and hourly averages. Adjust date ranges as needed.
- **Navigation**: Return to the main overview page using the provided link or button on the detail pages.


### Docker deployment
1. **Clone the repository**:
   ```bash
   git clone https://github.com/SebastianOndrus/electricity-price-app.git
   cd electricity-price-app
   ```
2. **Build the Docker image**:
    ```bash
    docker build -t electricity-price-app .
    ```
3. **Run the Docker container**:
    ```bash
    docker run -p 3000:3000 electricity-price-app
    ```