# Disassociate

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/IamAnkitRB/Disassoci8.git
   cd Disassoci8
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Prisma CLI** (if not already installed globally):

   ```bash
   npm install -g prisma
   ```

4. **Set up the database**:
   ```bash
   npx prisma migrate dev
   ```

---

## Environment Configuration

Create a `.env` file in the project root and add the following environment variables:

```env
# Server
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# HubSpot OAuth
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:3000/hubspot/oauth/callback

# HubSpot Developer API Key
HUBSPOT_DEVELOPER_API_KEY=your_developer_api_key

# App Info
HUBSPOT_APP_ID=your_app_id
API_BASE_URL=http://localhost:3000
```

Replace the placeholders (`your_hubspot_client_id`, etc.) with your actual credentials.

---

## Running the Application

1. **Start the server**:

   ```bash
   npm run dev
   ```

2. **Verify the server is running**:
   Open your browser or Postman and navigate to `http://localhost:3000/health`.

---

## Usage

### Available Endpoints

#### OAuth Callback

- **GET `/hubspot/oauth/callback`**
  Handles OAuth token exchange and stores user credentials.

#### Fetch Objects

- **POST `/hubspot/fetchObjects`**
  Fetches all default and custom objects from HubSpot.

#### Fetch Properties

- **POST `/hubspot/fetchProps`**
  Fetches properties of a specific HubSpot object.

#### Fetch Association Labels

- **POST `/hubspot/fethcAssociationLabels`**
  Retrieves association labels between two object types.

#### Disassociate Objects

- **POST `/hubspot/disassociate`**
  Disassociates two HubSpot objects using their types and association label.

#### Create Custom Workflow Action

- **POST `/hubspot/workflow/createCustomWorkflowAction`**
  Creates a new custom workflow action for disassociation.

#### Update Custom Workflow Action

- **POST `/hubspot/workflow/updateCustomWorkflowAction`**
  Updates an existing custom workflow action.

---

## Project Structure

```plaintext
hubspot-integration/
├── controllers/         # API controllers
├── routes/              # Route definitions
├── services/            # Service layer for business logic
├── utils/               # Utility functions
├── prisma/              # Prisma schema and migrations
├── .env                 # Environment variables
├── package.json         # Node.js dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

---
