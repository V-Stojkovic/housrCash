# housrCash
GUH 2025 Implementing a cashback rewards concept for Housr

## Prerequisites

Before you begin, ensure you have met the following requirements:

* **Node.js**: v18 or higher installed. ([Download](https://nodejs.org/))
* **MySQL**: A running MySQL server instance.

## Backend
### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/V-Stojkovic/housrCash.git
    cd housrCash/back_end
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    * Create a `.env` file in the root directory.
    * Create a database on your local SQL server
    * Copy the following template and fill in your local database details:
        ```env
        PORT=3000
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_local_password
        DB_NAME=housrcash
        DB_PORT=3306
        ```

4.  **Initialize Database:**
    Run the initialization script to create the necessary database and tables.
    ```bash
    npm run db:init
    ```

## Running the Application

* **Development Mode (with hot-reload):**
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:4000`.

* **Production Build:**
    ```bash
    npm run build
    npm start
    ```

## Project Structure

* `src/api`: API Route definitions and controllers (v0, v1, etc.).
* `src/services`: Business logic and database interaction layer.
* `src/models`: Database schema interfaces and Types.
* `DBHelpers/`: Database initialization and maintenance scripts.