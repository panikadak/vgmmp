# Implementation Roadmap: Security Improvements

## 📋 Pre-Implementation Checklist

### 1. Environment Setup
- [ ] **Backup Database**: Create full backup of Supabase project
- [ ] **Backup Codebase**: Create Git branch `security-improvements`
- [ ] **Staging Environment**: Set up staging environment for testing
- [ ] **Environment Variables**: Copy `env.example` to `.env.local` and configure

### 2. Dependencies Installation
```bash
# Add required security dependencies
npm install isomorphic-dompurify
npm install @types/dompurify
```

### 3. Team Coordination
- [ ] **Development Team**: Brief on security changes
- [ ] **Testing Plan**: Prepare security testing checklist
- [ ] **Rollback Plan**: Document rollback procedures

---

## 🚨 Phase 1: Critical Security Fixes (Days 1-2)

### Day 1 Morning: Environment & Configuration (2-3 hours)

#### Step 1.1: Environment Variables Security
```bash
# 1. Create environment file from template
cp env.example .env.local

# 2. Generate secure NextAuth secret
openssl rand -base64 32

# 3. Configure all required variables in .env.local
```

**Files to create/modify:**
- [✅] `env.example` (created)
- [✅] `lib/config.ts` (created)
- [ ] `.env.local` (user must create)

**Validation:**
```bash
npm run dev # Should show "✅ Environment variables validated successfully"
```

#### Step 1.2: Security Headers Implementation
**Modify: `next.config.mjs`**

```javascript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' wss: https:",
              "frame-src 'none'"
            ].join('; ')
          }
        ]
      }
    ]
  }
}
```

### Day 1 Afternoon: Rate Limiting (3-4 hours)

#### Step 1.3: Rate Limiting Implementation
**Files to create/modify:**
- [✅] `lib/middleware/rate-limit.ts` (created)
- [ ] `middleware.ts` (update)

**Update: `middleware.ts`**
```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/middleware/rate-limit"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Skip for static files
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".")
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
```

**Testing:**
```bash
# Test rate limiting (use curl or browser dev tools)
curl -X POST http://localhost:3000/api/auth/signin
# Should see rate limit headers in response
```

---

## 🔐 Phase 2: Authentication & Authorization (Days 3-5)

### Day 3: Supabase Authentication Fix

#### Step 2.1: Create Secure Supabase Client
**Create: `lib/supabase/secure-client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'
import { config } from '@/lib/config'

// Server-side client with service role (full access)
export const supabaseAdmin = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Create authenticated client with user's JWT
export function createAuthenticatedClient(jwt: string) {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    }
  )
}
```

#### Step 2.2: Update Authentication Flow
**Modify: `app/api/auth/[...nextauth]/route.ts`**

Add Supabase JWT handling to NextAuth callbacks:

```typescript
// Add to authOptions
callbacks: {
  async jwt({ token, user, account }) {
    if (user) {
      // Create Supabase auth user when signing in
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: `${user.id}@wallet.local`,
        user_metadata: {
          wallet_address: user.id,
          auth_method: 'siwe'
        }
      })
      
      if (data.user) {
        token.supabaseAccessToken = data.session?.access_token
      }
    }
    return token
  },
  async session({ session, token }) {
    session.address = token.sub
    session.supabaseAccessToken = token.supabaseAccessToken
    session.user = {
      name: token.sub,
    }
    return session
  },
}
```

#### Step 2.3: Update Service Functions
**Modify all service files to use proper authentication:**

**Update: `lib/supabase/games.ts`**
```typescript
import { createAuthenticatedClient, supabaseAdmin } from './secure-client'

// Replace createAuthenticatedClient function with:
function getAuthenticatedClient(session?: { supabaseAccessToken?: string }) {
  if (session?.supabaseAccessToken) {
    return createAuthenticatedClient(session.supabaseAccessToken)
  }
  throw new Error('Authentication required')
}

// Update all functions to use session instead of wallet address
export async function createGame(game: GameInsert, session?: Session) {
  const client = session ? getAuthenticatedClient(session) : supabaseAdmin
  // ... rest of function
}
```

### Day 4: Row Level Security Implementation

#### Step 2.4: Apply RLS Migrations
```bash
# Apply the comments RLS migration
supabase migration new implement_comments_rls --sql-from 004_implement_comments_rls.sql

# Create ratings RLS migration
supabase migration new implement_ratings_rls
```

**Create: `supabase/migrations/005_implement_ratings_rls.sql`**
```sql
-- Enable RLS on ratings and rating_sessions tables
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_sessions ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can submit ratings" ON ratings FOR INSERT WITH CHECK (true);

-- Rating sessions policies  
CREATE POLICY "Anyone can create rating sessions" ON rating_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own sessions" ON rating_sessions FOR SELECT USING (true);

-- Prevent rating manipulation
CREATE POLICY "Ratings cannot be updated" ON ratings FOR UPDATE USING (false);
CREATE POLICY "Ratings cannot be deleted by users" ON ratings FOR DELETE USING (false);

-- Admin can moderate ratings
CREATE POLICY "Admins can moderate ratings" ON ratings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM authorized_admins 
    WHERE LOWER(wallet_address) = LOWER(auth.jwt() ->> 'sub') 
    AND is_active = true
  )
);
```

#### Step 2.5: Update Admin Access Management
**Update: `app/admin/page.tsx`**

Replace hardcoded admin address with environment variable:

```typescript
import { isAuthorizedAdmin } from '@/lib/config'

// Replace AUTHORIZED_ADMIN_ADDRESS check with:
if (!session?.address || !isAuthorizedAdmin(session.address)) {
  // Show access denied
}
```

### Day 5: Testing & Validation

#### Step 2.6: Comprehensive Testing
```bash
# Run database migrations
supabase db reset

# Test authentication flow
npm run dev
# 1. Connect wallet
# 2. Sign SIWE message  
# 3. Verify session has supabaseAccessToken
# 4. Test admin access
# 5. Test comment creation/editing
# 6. Test RLS policies
```

---

## 🛡️ Phase 3: Security Hardening (Days 6-8)

### Day 6: Enhanced Input Validation

#### Step 3.1: Install DOMPurify
```bash
npm install isomorphic-dompurify
npm install @types/dompurify
```

#### Step 3.2: Update Content Sanitization
**Create: `lib/security/content-sanitizer.ts`**

```typescript
import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

// Content validation schemas
export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment too long')
    .refine(
      (content) => {
        const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })
        return sanitized.length > 0
      },
      'Comment contains invalid content'
    )
})

export const gameSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  // ... other fields
})

// Enhanced sanitization
export function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: []
  }).trim()
}
```

**Update: `lib/supabase/comments.ts`**
```typescript
import { sanitizeContent, commentSchema } from '@/lib/security/content-sanitizer'

function validateComment(content: string) {
  try {
    commentSchema.parse({ content })
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: error.errors[0]?.message || 'Invalid content' 
    }
  }
}
```

### Day 7: File Upload Security

#### Step 3.3: Secure File Upload
**Create: `lib/security/file-validator.ts`**

```typescript
import { config } from '@/lib/config'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp'
]

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = config.uploads.maxSizeMB * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${config.uploads.maxSizeMB}MB` }
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only images allowed.' }
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !config.uploads.allowedTypes.includes(extension)) {
    return { valid: false, error: 'Invalid file extension.' }
  }

  return { valid: true }
}
```

### Day 8: Content Filtering & Monitoring

#### Step 3.4: Enhanced Content Filtering
**Create: `lib/security/content-filter.ts`**

```typescript
// More sophisticated content filtering
const PROFANITY_PATTERNS = [
  /f[u*]+ck/gi,
  /sh[i*]+t/gi,
  // Add more patterns
]

const SPAM_PATTERNS = [
  /(.)\1{4,}/g, // Repeated characters
  /^[A-Z\s!]{20,}$/g, // All caps
  /(https?:\/\/[^\s]+)/g, // URLs
]

export function analyzeContent(content: string): {
  safe: boolean
  reasons: string[]
  confidence: number
} {
  const reasons: string[] = []
  let riskScore = 0

  // Check profanity
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      reasons.push('Contains profanity')
      riskScore += 0.3
    }
  }

  // Check spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      reasons.push('Appears to be spam')
      riskScore += 0.2
    }
  }

  return {
    safe: riskScore < 0.5,
    reasons,
    confidence: Math.min(1, riskScore)
  }
}
```

---

## 📊 Phase 4: Monitoring & Testing (Days 9-10)

### Day 9: Security Monitoring

#### Step 4.1: Security Event Logging
**Create: `lib/monitoring/security-logger.ts`**

```typescript
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'unauthorized_access' | 'content_violation'
  userId?: string
  ip: string
  userAgent: string
  details: Record<string, any>
  timestamp: Date
}

class SecurityLogger {
  private events: SecurityEvent[] = []

  log(event: Omit<SecurityEvent, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: new Date()
    })

    // In production, send to monitoring service
    if (config.isProduction) {
      this.sendToMonitoring(event)
    }
  }

  private async sendToMonitoring(event: SecurityEvent) {
    // Send to your monitoring service (e.g., Sentry, DataDog)
    console.error('Security Event:', event)
  }
}

export const securityLogger = new SecurityLogger()
```

### Day 10: Automated Testing

#### Step 4.2: Security Test Suite
**Create: `tests/security.test.ts`**

```typescript
import { describe, it, expect } from '@jest/globals'
import { rateLimit } from '@/lib/middleware/rate-limit'
import { validateFile } from '@/lib/security/file-validator'
import { sanitizeContent } from '@/lib/security/content-sanitizer'

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    it('should block requests after limit exceeded', () => {
      // Test rate limiting logic
    })
  })

  describe('Content Sanitization', () => {
    it('should remove HTML tags', () => {
      const dirty = '<script>alert("xss")</script>Hello'
      const clean = sanitizeContent(dirty)
      expect(clean).toBe('Hello')
    })
  })

  describe('File Validation', () => {
    it('should reject files over size limit', () => {
      const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.jpg')
      const result = validateFile(largeFile)
      expect(result.valid).toBe(false)
    })
  })
})
```

---

## 🚀 Deployment Strategy

### Staging Deployment (Day 8-9)
1. **Deploy to staging environment**
2. **Run security test suite**  
3. **Performance testing**
4. **User acceptance testing**

### Production Deployment (Day 10-11)

#### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Security headers verified
- [ ] Rate limiting configured
- [ ] Monitoring in place

#### Deployment Steps
1. **Deploy Phase 1** (off-peak hours)
   - Environment validation
   - Security headers
   - Rate limiting

2. **Deploy Phase 2** (maintenance window)
   - Database migrations
   - Authentication updates
   - RLS policies

3. **Deploy Phase 3** (gradual rollout)
   - Input validation
   - File security
   - Content filtering

4. **Deploy Phase 4** (background)
   - Monitoring
   - Logging
   - Testing

---

## 📈 Success Metrics & Validation

### Security KPIs to Monitor
- [ ] Zero critical vulnerabilities in security scans
- [ ] <1% rate limit false positives
- [ ] 100% RLS policy coverage
- [ ] Zero authentication bypasses
- [ ] <100ms security overhead

### Post-Deployment Validation
1. **Security Scan**: Run automated security scanner
2. **Penetration Testing**: Manual security testing
3. **Performance Impact**: Measure response time impact
4. **User Experience**: Verify no functionality broken
5. **Monitoring Setup**: Confirm alerts working

---

## 🆘 Emergency Procedures

### Rollback Plan
```bash
# Database rollback
supabase db reset --db-url [backup-url]

# Code rollback  
git checkout main
npm run build && npm run start

# Environment rollback
cp .env.backup .env.local
```

### Emergency Contacts
- **Security Team**: [Contact Info]
- **DevOps Team**: [Contact Info]  
- **Database Admin**: [Contact Info]

---

## 📚 Documentation Requirements

### Updated Documentation
- [ ] Security policy document
- [ ] API documentation with rate limits
- [ ] Admin procedures guide
- [ ] Incident response plan
- [ ] Environment setup guide

### Team Training
- [ ] Security best practices session
- [ ] RLS policy training
- [ ] Incident response drill
- [ ] Code review checklist update

---

**Total Estimated Time**: 10-12 days  
**Critical Path**: Authentication & RLS (Days 3-5)  
**Parallel Work**: Documentation, Testing setup  
**Review Points**: After each phase completion 