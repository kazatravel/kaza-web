# Sprint 1 Implementation Guide - Foundation (Weeks 1-2)

**Duration:** 2 weeks  
**Goal:** Set up foundational infrastructure and development environment  
**Team:** Backend Dev, Frontend Dev, Jackson (CAO/Architect)  

---

## Overview

By end of Sprint 1, we should have:
- ✅ Next.js 14 project deployed to Vercel staging
- ✅ PostgreSQL database on Neon with Prisma ORM
- ✅ Authentication system (NextAuth.js)
- ✅ Basic UI framework (Shadcn/ui + Tailwind)
- ✅ Agent API endpoints scaffolded
- ✅ Development workflow established (git, CI/CD)

---

## Day 1-2: Project Setup & Infrastructure

### Task 1.1: Create Next.js Project

**Owner:** Backend Dev  

```bash
# Create new Next.js 14 project with TypeScript
npx create-next-app@latest honeymoon-planner --typescript --tailwind --app --src-dir

cd honeymoon-planner

# Install core dependencies
npm install @prisma/client prisma zod next-auth
npm install -D @types/node @types/react

# Install UI dependencies
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge lucide-react
npx shadcn-ui@latest init

# Install agent/API dependencies
npm install @tanstack/react-query zustand ky

# Install dev tools
npm install -D prettier eslint-config-prettier
```

**Deliverable:** Working Next.js dev server at `localhost:3000`

---

### Task 1.2: Set Up Neon Database

**Owner:** Backend Dev  

1. Sign up at https://neon.tech (use GitHub login)
2. Create new project: `honeymoon-planner-staging`
3. Copy connection string to `.env.local`:

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/honeymoon?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/honeymoon?sslmode=require"
```

4. Initialize Prisma:

```bash
npx prisma init
```

5. Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Deliverable:** Prisma connected to Neon database

---

### Task 1.3: Implement Database Schema (Phase 1)

**Owner:** Backend Dev  
**Reference:** See full schema in ARCHITECTURE.md

Start with core models only (add others in Sprint 2):

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  hashedPassword String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  preferences   UserPreferences?
  sessions      TripSession[]
  accounts      Account[]
  Session       Session[]
}

// NextAuth.js models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserPreferences {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  homeCity          String?
  interests         String[]
  activityLevel     String?
  dietaryNeeds      String[]
  mustHaves         String[]
  dealBreakers      String[]
  
  updatedAt         DateTime  @updatedAt
}

model TripSession {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status            String    @default("active")
  entryMode         String?
  
  totalBudget       Decimal?  @db.Decimal(10, 2)
  budgetBreakdown   Json?
  
  tripLength        Int?
  travelDates       Json?
  numTravelers      Int       @default(2)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

Run migration:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Deliverable:** Database schema deployed, Prisma client generated

---

### Task 1.4: Deploy to Vercel Staging

**Owner:** Backend Dev  

1. Sign up at https://vercel.com (use GitHub login)
2. Install Vercel CLI:

```bash
npm i -g vercel
vercel login
```

3. Link project:

```bash
vercel link
# Select: Create new project
# Project name: honeymoon-planner
```

4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (from Neon)
   - `DIRECT_URL` (from Neon)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (Vercel preview URL)

5. Deploy:

```bash
vercel --prod
```

6. Set up GitHub integration:
   - Push code to GitHub
   - Connect repo to Vercel project
   - Enable automatic deployments (every push = preview)

**Deliverable:** Live staging URL (e.g., `honeymoon-planner.vercel.app`)

---

## Day 3-4: Authentication System

### Task 2.1: Set Up NextAuth.js

**Owner:** Backend Dev  

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

Create signup endpoint `src/app/api/auth/signup/route.ts`:

```typescript
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = signupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
```

**Deliverable:** Working authentication (signup, signin, session management)

---

### Task 2.2: Build Auth UI

**Owner:** Frontend Dev  

Create sign-in page `src/app/auth/signin/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Deliverable:** Working sign-in/sign-up UI

---

## Day 5-7: Agent API Infrastructure

### Task 3.1: Create Agent API Routes

**Owner:** Backend Dev  

Create agent middleware `src/lib/agent-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"

export function withAgentAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // For MVP: Simple token check
    // TODO: Replace with proper JWT validation
    if (token !== process.env.AGENT_API_TOKEN) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    return handler(req)
  }
}
```

Create agent search endpoint `src/app/api/agent/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAgentAuth } from "@/lib/agent-middleware"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const searchSchema = z.object({
  sessionId: z.string(),
  preferences: z.object({
    interests: z.array(z.string()),
    budget: z.number().optional(),
    tripLength: z.number(),
  })
})

async function handler(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, preferences } = searchSchema.parse(body)

    // Verify session exists
    const session = await prisma.tripSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // TODO: Trigger agent task (placeholder for now)
    // This will be replaced with OpenClaw agent integration
    
    return NextResponse.json({
      taskId: "placeholder-task-id",
      status: "processing",
      message: "Agent search initiated"
    })
  } catch (error) {
    console.error("Agent search error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const POST = withAgentAuth(handler)
```

**Deliverable:** Agent API endpoints scaffolded (search, build, optimize)

---

### Task 3.2: Create Agent Webhook Handler

**Owner:** Backend Dev  

Create webhook endpoint `src/app/api/webhooks/agent-complete/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAgentAuth } from "@/lib/agent-middleware"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const webhookSchema = z.object({
  taskId: z.string(),
  type: z.enum(["search", "build", "optimize"]),
  sessionId: z.string(),
  result: z.any(),
  status: z.enum(["success", "error"]),
})

async function handler(req: NextRequest) {
  try {
    const body = await req.json()
    const webhook = webhookSchema.parse(body)

    // Store result in database based on type
    if (webhook.type === "search" && webhook.status === "success") {
      // Create destination records
      const destinations = webhook.result.destinations || []
      
      for (const dest of destinations) {
        await prisma.destination.create({
          data: {
            sessionId: webhook.sessionId,
            name: dest.name,
            country: dest.country,
            city: dest.city,
            description: dest.description,
            reasoning: dest.reasoning,
            estimatedCostLow: dest.costRange?.low,
            estimatedCostHigh: dest.costRange?.high,
            bestMonths: dest.bestMonths || [],
          }
        })
      }
    }

    // TODO: Emit SSE event to frontend (notify user of completion)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const POST = withAgentAuth(handler)
```

**Deliverable:** Webhook handler for agent results

---

## Day 8-10: Frontend Foundation

### Task 4.1: Set Up Shadcn/ui Components

**Owner:** Frontend Dev  

Install core components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
```

Create layout `src/app/(dashboard)/layout.tsx`:

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.Node
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Honeymoon Planner</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
```

**Deliverable:** UI component library set up, basic dashboard layout

---

### Task 4.2: Build Dashboard Home

**Owner:** Frontend Dev  

Create `src/app/(dashboard)/dashboard/page.tsx`:

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  const sessions = await prisma.tripSession.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Trips</h1>
        <Link href="/dashboard/new">
          <Button>Plan New Trip</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No trips yet. Start planning your honeymoon!</p>
            <Link href="/dashboard/new">
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>Trip Session</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Created: {session.createdAt.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {session.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Deliverable:** Basic dashboard showing trip sessions

---

## Sprint 1 Checklist

### Infrastructure ✅
- [ ] Next.js 14 project created with TypeScript
- [ ] Deployed to Vercel staging environment
- [ ] Neon PostgreSQL database configured
- [ ] Prisma ORM set up with initial schema
- [ ] GitHub repo with CI/CD pipeline

### Authentication ✅
- [ ] NextAuth.js configured
- [ ] Sign-up endpoint working
- [ ] Sign-in page functional
- [ ] Protected routes (dashboard)
- [ ] Session management

### Agent API ✅
- [ ] Agent middleware (auth, rate limiting)
- [ ] `/api/agent/search` endpoint scaffolded
- [ ] `/api/webhooks/agent-complete` webhook handler
- [ ] Basic error handling and logging

### Frontend ✅
- [ ] Shadcn/ui components installed
- [ ] Dashboard layout with navigation
- [ ] Homepage showing trip sessions
- [ ] "Plan New Trip" button (links to placeholder)

### Documentation ✅
- [ ] README with setup instructions
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API endpoint documentation (Swagger or similar)

---

## Success Criteria

**By end of Sprint 1:**
1. A user can sign up and log in
2. Dashboard shows existing trip sessions (empty for new users)
3. Agent API endpoints respond (even if just placeholders)
4. Code is deployed to staging and accessible via URL
5. Development workflow established (git → Vercel auto-deploy)

**What's NOT in Sprint 1:**
- ❌ Actual API integrations (Amadeus, Google Places)
- ❌ Destination discovery UI
- ❌ Itinerary builder
- ❌ Real agent logic (that's Sprint 2-3)

---

## Sprint 2 Preview

**Next priorities:**
- Amadeus Flight API integration
- Hotel price comparison API
- Preference collection UI
- Research Agent implementation (real OpenClaw integration)
- Destination comparison workflow

---

**Questions?** Tag Jackson (CAO) in Slack or GitHub issues.
