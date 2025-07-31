# AlphaLens Feature Evaluation Framework

A collaborative web application for evaluating potential features using a weighted scoring framework and visualizing them on an Eisenhower Priority Matrix for strategic decision-making.

## Features

- **User Authentication**: Secure login with @deckmatch.com email addresses only
- **Collaborative Scoring**: Multiple users can score the same feature across 6 criteria
- **Consensus Analysis**: Visualize score distributions and consensus levels
- **Priority Matrix**: Automatic plotting on Eisenhower Matrix based on scores
- **Persistent Storage**: All data saved to database with real-time updates
- **Modern UI**: Dark theme with responsive design using Nuxt UI and Tailwind CSS

## Tech Stack

- **Frontend**: Vue 3, Nuxt 3, TypeScript, Tailwind CSS, Nuxt UI
- **Backend**: Nuxt Server API, SQLite with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Database**: SQLite (easily changeable to PostgreSQL/MySQL)

## Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change this in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-123456789"

# App Configuration
NUXT_PUBLIC_APP_NAME="AlphaLens Feature Matrix"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

```bash
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with any @deckmatch.com email address.

## Usage

### Creating Features
1. Sign in with your @deckmatch.com email
2. Use the "Create New Feature" form to add features
3. Provide a name and optional description

### Scoring Features
1. Select any feature from the list
2. Score it across 6 criteria (1-5 scale):
   - Strategic Alignment & Value Creation (25%)
   - User Impact & Time-to-Value (20%)
   - Data & Technical Feasibility (20%)
   - Market Differentiation (15%)
   - Revenue & Growth Impact (10%)
   - Compliance & Risk (10%)
3. Submit your scores

### Viewing Results
- **Score Analysis**: See average scores, consensus levels, and recommendations
- **Priority Matrix**: Features automatically plotted based on Impact vs Effort
- **Features List**: View all features sorted by score with consensus indicators

## Scoring Criteria

### Strategic Alignment & Value Creation (25%)
- 5: Directly amplifies our core 'similar companies/products' differentiator
- 4: Strongly supports PLG growth flywheel
- 3: Enhances existing workflows without diluting focus
- 2: Tangentially related to core value proposition
- 1: Distracts from or contradicts strategic direction

### User Impact & Time-to-Value (20%)
- 5: Delivers instant 'aha!' moment for target persona
- 4: Significant workflow improvement (>50% time savings)
- 3: Moderate efficiency gain (20-50% improvement)
- 2: Minor convenience feature
- 1: Negligible impact on user outcomes

### Data & Technical Feasibility (20%)
- 5: Leverages existing infrastructure with minimal additions
- 4: Requires moderate engineering effort (1-2 sprints)
- 3: Significant development needed (3-4 sprints)
- 2: Major architectural changes required
- 1: Fundamentally incompatible with current stack

### Market Differentiation (15%)
- 5: Industry-first capability no competitor can replicate
- 4: Significantly better execution than alternatives
- 3: Matches competitor features with unique twist
- 2: Table stakes feature we're missing
- 1: Already commoditized in market

### Revenue & Growth Impact (10%)
- 5: Direct revenue driver (>20% increase in conversions)
- 4: Strong retention impact (>15% reduction in churn)
- 3: Moderate monetization potential
- 2: Indirect revenue impact
- 1: No clear path to monetization

### Compliance & Risk (10%)
- 5: No regulatory concerns, enhances data security
- 4: Standard compliance requirements, well-understood
- 3: Some regulatory complexity but manageable
- 2: Significant compliance burden
- 1: High regulatory risk or data sensitivity issues

## Priority Matrix Quadrants

- **Quick Wins** (High Impact, Low Effort): Implement immediately
- **Strategic Initiatives** (High Impact, High Effort): Roadmap for next quarter
- **Nice-to-Haves** (Low Impact, Low Effort): Backlog
- **Avoid** (Low Impact, High Effort): Decline or defer

## Database Commands

```bash
# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Deployment

For production deployment:
1. Change `JWT_SECRET` to a secure random string
2. Update `DATABASE_URL` to your production database
3. Set `NODE_ENV=production`
4. Build and deploy: `npm run build`

## Architecture

### Database Schema
- **Users**: Store @deckmatch.com users
- **Features**: Feature details and creator
- **Scores**: Individual user scores for each feature

### API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out
- `GET /api/features` - List all features with scores
- `POST /api/features` - Create new feature
- `POST /api/scores` - Submit/update feature scores

### Key Components
- `FeatureForm` - Create new features
- `FeatureScoring` - Score features across criteria
- `ScoreResults` - Display consensus and analysis
- `PriorityMatrix` - Eisenhower matrix visualization
- `FeaturesList` - Browse and select features

## Contributing

This is an internal tool for the AlphaLens team. For feature requests or issues, please reach out to the product team.
