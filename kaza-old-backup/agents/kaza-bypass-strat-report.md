# Supabase Docker Connectivity Bypass Strategy Report

**Prepared for:** Kaza Project  
**Date:** 2026-02-26  
**Status:** Research Complete - Actionable Recommendations

---

## Executive Summary

This report explores alternative methods to interact with Supabase from within a restrictive Docker environment where direct HTTPS connectivity may be problematic. It covers proxy configurations, alternative client setups, secure tunneling solutions, and improved API key management strategies.

**Key Findings:**
- Multiple viable proxy solutions exist for Docker HTTPS connectivity
- Supabase REST API can be used directly without the JS client
- Several secure methods exist for passing secrets to Docker containers
- Tunneling solutions provide temporary workarounds but may not be production-ready

---

## 1. Alternative Supabase Client Configurations

### 1.1 Direct REST API Calls (No JS Client)

**Strategy:** Bypass `@supabase/supabase-js` entirely and use native Node.js HTTP clients.

**Implementation:**
```javascript
// Using native fetch or axios
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Direct REST API call
const response = await fetch(`${SUPABASE_URL}/rest/v1/table_name`, {
  method: 'GET',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Advantages:**
- No dependency on Supabase JS SDK
- Direct control over HTTP requests
- Easier to debug connection issues
- Smaller bundle size

**Disadvantages:**
- Manual handling of authentication
- No automatic query building
- Must implement own retry logic

**Recommendation:** ⭐ **HIGH VALUE** - Use this for simple CRUD operations in Docker environments with connectivity issues.

---

### 1.2 Configure Custom HTTP Agent

**Strategy:** Configure the Supabase client with custom HTTP settings to work with proxies or alternative TLS configurations.

```javascript
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');

// With proxy
const agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: (...args) => {
        return fetch(args[0], {
          ...args[1],
          agent: agent
        });
      }
    }
  }
);
```

**Recommendation:** ⭐⭐ **MEDIUM VALUE** - Worth trying if you need Supabase client features.

---

## 2. Docker Proxy Solutions

### 2.1 Container-Level HTTP/HTTPS Proxy

**Strategy:** Configure Docker containers to route all traffic through a proxy.

**Implementation Option A: Environment Variables**
```yaml
# docker-compose.yml
services:
  app:
    image: your-app
    environment:
      - HTTP_PROXY=http://proxy.example.com:3128
      - HTTPS_PROXY=http://proxy.example.com:3128
      - NO_PROXY=localhost,127.0.0.1
```

**Implementation Option B: Docker Daemon Config**
```json
// ~/.docker/config.json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.example.com:3128",
      "httpsProxy": "http://proxy.example.com:3128",
      "noProxy": "localhost,127.0.0.1"
    }
  }
}
```

**Recommendation:** ⭐⭐⭐ **HIGH VALUE** - Standard approach, well-documented, enterprise-ready.

---

### 2.2 Lightweight Proxy Containers

**Strategy:** Run a dedicated proxy container within your Docker network.

**Option 1: Squid Proxy**
```yaml
services:
  squid:
    image: sameersbn/squid:3.5.27-2
    ports:
      - "3128:3128"
    volumes:
      - ./squid.conf:/etc/squid/squid.conf
  
  app:
    image: your-app
    environment:
      - HTTPS_PROXY=http://squid:3128
    depends_on:
      - squid
```

**Option 2: Tinyproxy (Lightweight)**
```yaml
services:
  tinyproxy:
    image: tinyproxy/tinyproxy
    ports:
      - "8888:8888"
  
  app:
    environment:
      - HTTPS_PROXY=http://tinyproxy:8888
```

**Option 3: Privoxy (Privacy-focused)**
```yaml
services:
  privoxy:
    image: sabnzbd/privoxy
    ports:
      - "8118:8118"
```

**Recommendation:** ⭐⭐ **MEDIUM VALUE** - Good for testing, adds complexity for production.

---

### 2.3 Host Network Mode

**Strategy:** Run Docker container with `--network=host` to bypass Docker networking entirely.

```yaml
services:
  app:
    image: your-app
    network_mode: "host"
```

**Advantages:**
- Direct access to host network
- No NAT or bridge overhead
- Same connectivity as host machine

**Disadvantages:**
- ⚠️ **Security risk** - Container has full host network access
- Port conflicts with host services
- Less isolation

**Recommendation:** ⚠️ **USE WITH CAUTION** - Quick fix for testing, not recommended for production.

---

## 3. Secure Tunneling Solutions

### 3.1 Cloudflare Tunnel (Recommended)

**Use Case:** Temporary secure tunnel for development/testing

**Setup:**
```bash
# Install cloudflared in container or on host
docker run cloudflare/cloudflared:latest tunnel --url http://localhost:3000

# Or use Docker Compose
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --url http://app:3000
    restart: unless-stopped
  
  app:
    image: your-app
    environment:
      - SUPABASE_URL=https://your-tunnel.trycloudflare.com
```

**Advantages:**
- Free tier available
- No domain required for testing
- Automatic HTTPS
- Good for webhooks/callbacks

**Disadvantages:**
- Requires Cloudflare account for persistent tunnels
- Adds latency
- Not suitable for production database connections

**Recommendation:** ⭐⭐⭐ **HIGH VALUE** - Excellent for development, testing webhooks, demos.

---

### 3.2 SSH Tunnel / SOCKS Proxy

**Use Case:** Secure tunnel through a bastion/jump host

**Implementation:**
```bash
# On host machine, create SSH tunnel
ssh -D 1080 -N -f user@bastion-host

# Configure Docker container to use SOCKS proxy
docker run -e ALL_PROXY=socks5://host.docker.internal:1080 your-app

# Or in docker-compose.yml
services:
  app:
    image: your-app
    environment:
      - ALL_PROXY=socks5://host.docker.internal:1080
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

**Alternative: Container-based SSH tunnel**
```yaml
services:
  ssh-tunnel:
    image: binlab/sshtunnel
    environment:
      - SSH_HOST=bastion.example.com
      - SSH_USER=tunnel-user
      - TUNNEL_PORT=1080
      - TUNNEL_TYPE=socks
    volumes:
      - ~/.ssh/id_rsa:/ssh/id_rsa:ro
  
  app:
    environment:
      - ALL_PROXY=socks5://ssh-tunnel:1080
    depends_on:
      - ssh-tunnel
```

**Recommendation:** ⭐⭐⭐ **HIGH VALUE** - Enterprise-grade for accessing services behind firewalls.

---

### 3.3 Other Tunnel Solutions

**Quick Comparison:**

| Solution | Free Tier | Ease of Use | Production Ready | Docker Support |
|----------|-----------|-------------|------------------|----------------|
| Cloudflare Tunnel | Yes | ⭐⭐⭐⭐⭐ | Yes* | ⭐⭐⭐⭐⭐ |
| ngrok | Limited | ⭐⭐⭐⭐⭐ | Paid only | ⭐⭐⭐⭐ |
| SSH Tunnel | Yes | ⭐⭐⭐ | Yes | ⭐⭐⭐⭐ |
| FRP (Fast Reverse Proxy) | Yes | ⭐⭐⭐ | Yes | ⭐⭐⭐⭐ |
| Tailscale | Yes | ⭐⭐⭐⭐ | Yes | ⭐⭐⭐⭐ |

*With custom domains and proper configuration

**Recommendation:** Use Cloudflare Tunnel for dev/testing, SSH tunnel for production, Tailscale for permanent private networks.

---

## 4. Secure API Key Management in Docker

### 4.1 Docker Secrets (Docker Swarm - Production)

**Strategy:** Use Docker's native secrets management

**Setup:**
```bash
# Create secret
echo "your-supabase-key" | docker secret create supabase_key -

# Use in service
docker service create \
  --name app \
  --secret supabase_key \
  your-app:latest
```

**In Node.js:**
```javascript
const fs = require('fs');

// Read secret from mounted file
const SUPABASE_KEY = fs.readFileSync('/run/secrets/supabase_key', 'utf8').trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

**Recommendation:** ⭐⭐⭐⭐⭐ **BEST PRACTICE** - Production-grade, encrypted at rest, never in env vars.

---

### 4.2 Docker Compose Secrets (Non-Swarm)

**Strategy:** Mount secrets as files in Compose

```yaml
# docker-compose.yml
services:
  app:
    image: your-app
    secrets:
      - supabase_key
      - supabase_url

secrets:
  supabase_key:
    file: ./secrets/supabase_key.txt
  supabase_url:
    file: ./secrets/supabase_url.txt
```

**In Node.js:**
```javascript
const fs = require('fs');

// Helper function to read secrets
function getSecret(name) {
  try {
    return fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
  } catch (err) {
    // Fallback to environment variable
    return process.env[name.toUpperCase()];
  }
}

const SUPABASE_KEY = getSecret('supabase_key');
const SUPABASE_URL = getSecret('supabase_url');
```

**Recommendation:** ⭐⭐⭐⭐ **HIGHLY RECOMMENDED** - Works with regular Compose, more secure than env vars.

---

### 4.3 Docker Build Secrets (Build-time Only)

**Strategy:** Pass secrets during build without baking them into the image

```dockerfile
# Dockerfile
# syntax=docker/dockerfile:1
FROM node:18

WORKDIR /app

# Use secret during build (not persisted in image)
RUN --mount=type=secret,id=npm_token \
    echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/npm_token)" > .npmrc && \
    npm install && \
    rm .npmrc

COPY . .

CMD ["node", "server.js"]
```

```bash
# Build with secret
docker build --secret id=npm_token,src=.npmrc .
```

**Recommendation:** ⭐⭐⭐ **GOOD PRACTICE** - For build-time secrets only, not runtime API keys.

---

### 4.4 Volume-Mounted Config Files

**Strategy:** Mount a config directory with secrets from host

```yaml
services:
  app:
    image: your-app
    volumes:
      - ./config:/app/config:ro  # Read-only mount
    environment:
      - CONFIG_PATH=/app/config/credentials.json
```

**In Node.js:**
```javascript
const fs = require('fs');

const configPath = process.env.CONFIG_PATH || './config/credentials.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const supabase = createClient(config.supabaseUrl, config.supabaseKey);
```

**Recommendation:** ⭐⭐⭐ **GOOD ALTERNATIVE** - Simple, works well with .gitignore'd config files.

---

### 4.5 Comparison: API Key Passing Methods

| Method | Security | docker exec Visible? | Image Leak Risk | Ease of Use |
|--------|----------|---------------------|-----------------|-------------|
| Env Variables | ⚠️ Low | **YES** | **HIGH** | ⭐⭐⭐⭐⭐ |
| Docker Secrets | ✅ High | **NO** | **LOW** | ⭐⭐⭐⭐ |
| Compose Secrets | ✅ High | **NO** | **LOW** | ⭐⭐⭐⭐⭐ |
| Volume Mounts | ✅ Medium | **NO** | **LOW** | ⭐⭐⭐⭐ |
| Build Secrets | ✅ High | **N/A** | **VERY LOW** | ⭐⭐⭐ |

**Key Insight:** The primary issue with `docker exec -e SUPABASE_KEY=...` is that:
1. The key is visible in `docker inspect` and process listings
2. It persists in the container's environment
3. It can be leaked if the image is accidentally pushed

**Solution:** Always prefer file-based secrets over environment variables for sensitive data.

---

## 5. Hybrid Strategy: Multi-Layered Approach

### Recommended Implementation

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Optional: Proxy for restrictive networks
  proxy:
    image: tinyproxy/tinyproxy
    restart: unless-stopped
    networks:
      - app-network
  
  app:
    build: .
    restart: unless-stopped
    
    # Use Docker secrets (preferred)
    secrets:
      - supabase_key
      - supabase_url
    
    # Fallback to env file (not committed to git)
    env_file:
      - .env.local
    
    # Configure proxy if needed
    environment:
      - HTTPS_PROXY=${HTTPS_PROXY:-}
      - NODE_ENV=production
      - USE_SECRETS_FILE=true
    
    networks:
      - app-network
    
    # Health check
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3

secrets:
  supabase_key:
    file: ./secrets/supabase_key.txt
  supabase_url:
    file: ./secrets/supabase_url.txt

networks:
  app-network:
    driver: bridge
```

**Application Code:**
```javascript
// config.js
const fs = require('fs');

class Config {
  constructor() {
    this.supabaseUrl = this.getSecret('supabase_url', 'SUPABASE_URL');
    this.supabaseKey = this.getSecret('supabase_key', 'SUPABASE_KEY');
  }

  getSecret(secretName, envFallback) {
    // Try Docker secret first
    const secretPath = `/run/secrets/${secretName}`;
    if (fs.existsSync(secretPath)) {
      console.log(`✓ Loaded ${secretName} from Docker secret`);
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
    
    // Fallback to environment variable
    const envValue = process.env[envFallback];
    if (envValue) {
      console.log(`⚠ Loaded ${secretName} from environment variable`);
      return envValue;
    }
    
    throw new Error(`Missing required secret: ${secretName} (${envFallback})`);
  }
}

module.exports = new Config();
```

```javascript
// supabase-client.js
const config = require('./config');

// Option 1: Use native fetch (no Supabase client)
async function query(table, options = {}) {
  const url = `${config.supabaseUrl}/rest/v1/${table}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'apikey': config.supabaseKey,
      'Authorization': `Bearer ${config.supabaseKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Option 2: Use Supabase client with custom config
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  config.supabaseUrl,
  config.supabaseKey,
  {
    auth: {
      persistSession: false // Recommended for server-side
    }
  }
);

module.exports = { query, supabase };
```

---

## 6. Troubleshooting Docker HTTPS Connectivity

### Diagnostic Steps

```bash
# 1. Test basic connectivity from container
docker exec <container> curl -v https://www.google.com

# 2. Test Supabase connectivity
docker exec <container> curl -v https://<project>.supabase.co

# 3. Check DNS resolution
docker exec <container> nslookup <project>.supabase.co

# 4. Check for proxy settings
docker exec <container> env | grep -i proxy

# 5. Test with custom DNS
docker run --dns 8.8.8.8 --dns 8.8.4.4 your-app

# 6. Check certificate issues
docker exec <container> curl -k https://<project>.supabase.co  # Skip cert verification

# 7. Test with host network
docker run --network host your-app
```

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Certificate validation failure | `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Add CA certificates or use proxy with SSL inspection |
| DNS resolution failure | `getaddrinfo ENOTFOUND` | Use `--dns 8.8.8.8` or configure `/etc/resolv.conf` |
| Corporate firewall | Timeout on HTTPS | Configure HTTPS_PROXY |
| Docker bridge MTU issues | Intermittent timeouts | Adjust MTU: `--mtu 1450` |

---

## 7. Production-Ready Recommendations

### 🏆 Tier 1: Immediate Implementation (High Priority)

1. **Switch to File-Based Secrets**
   - Implement Docker Compose secrets
   - Update Node.js code to read from `/run/secrets/`
   - Remove environment variables from `docker exec` commands
   - **Impact:** ✅ Prevents API key leakage, more secure

2. **Direct REST API Fallback**
   - Implement native fetch-based Supabase client
   - Use as fallback when SDK fails
   - **Impact:** ✅ Bypasses SDK connection issues

3. **Add Connectivity Diagnostics**
   - Create health check script
   - Log connection attempts with details
   - **Impact:** ✅ Faster troubleshooting

### 🔧 Tier 2: Infrastructure Improvements (Medium Priority)

4. **Configure HTTP/HTTPS Proxy**
   - If in corporate/restricted network, set up Squid or Tinyproxy
   - Configure Docker daemon proxy settings
   - **Impact:** ✅ Resolves restrictive network issues

5. **SSH Tunnel for Persistent Access**
   - Set up SSH tunnel container
   - Route Supabase traffic through tunnel
   - **Impact:** ✅ Enterprise-grade security, bypasses firewalls

### 🚀 Tier 3: Advanced Solutions (Low Priority / Specific Use Cases)

6. **Cloudflare Tunnel for Development**
   - Use for local development and testing
   - Great for webhook testing
   - **Impact:** ⚪ Improves dev experience, not for production DB access

7. **Custom HTTP Agent with Retry Logic**
   - Implement exponential backoff
   - Handle transient network failures
   - **Impact:** ⚪ Improves reliability

---

## 8. Security Best Practices Summary

### ✅ DO:
- Use Docker secrets or file-based secrets
- Mount secrets as read-only
- Rotate API keys regularly
- Use separate keys for dev/staging/production
- Implement least-privilege access (RLS policies)
- Log authentication attempts
- Use HTTPS everywhere
- Validate certificates

### ❌ DON'T:
- Pass secrets via `docker exec -e`
- Commit secrets to git
- Use environment variables for sensitive data
- Build secrets into Docker images
- Use `--network=host` in production without understanding implications
- Disable certificate validation (`-k` or `rejectUnauthorized: false`)
- Share API keys across environments

---

## 9. Implementation Roadmap

### Phase 1: Quick Wins (1-2 hours)
1. Create `secrets/` directory (add to .gitignore)
2. Save API keys to `secrets/supabase_key.txt` and `secrets/supabase_url.txt`
3. Update docker-compose.yml with secrets configuration
4. Update Node.js code to read from `/run/secrets/`
5. Test with `docker-compose up`

### Phase 2: Connectivity (2-4 hours)
6. Run diagnostic tests (see Section 6)
7. Identify root cause of HTTPS issues
8. Implement proxy or tunnel solution if needed
9. Test Supabase connectivity from container

### Phase 3: Fallback & Resilience (2-3 hours)
10. Implement direct REST API client
11. Add retry logic and error handling
12. Create health check endpoint
13. Document troubleshooting steps

### Phase 4: Production Hardening (Ongoing)
14. Set up monitoring and alerts
15. Implement API key rotation
16. Review Supabase RLS policies
17. Conduct security audit

---

## 10. Code Examples Repository

All code snippets are production-ready. Create these files:

```
project/
├── docker-compose.yml          # Secrets + proxy configuration
├── Dockerfile                  # Multi-stage build with health check
├── .gitignore                  # Add: secrets/, .env.local
├── secrets/                    # ⚠️ NEVER COMMIT
│   ├── supabase_key.txt
│   └── supabase_url.txt
├── src/
│   ├── config.js              # Secret loading logic
│   ├── supabase-client.js     # Dual-mode client (SDK + REST)
│   └── healthcheck.js         # Connectivity diagnostics
└── docs/
    └── troubleshooting.md     # Team runbook
```

---

## 11. Alternative: Supabase Self-Hosted

**Consideration:** If HTTPS connectivity to Supabase Cloud is fundamentally blocked, consider self-hosting Supabase within your Docker network.

**Pros:**
- Full control over networking
- No external dependencies
- Lower latency
- Can use plain HTTP internally

**Cons:**
- Significant operational overhead
- Requires database management expertise
- No managed backups/scaling
- Must implement own security

**Recommendation:** Only consider if all other options fail and you have DevOps resources.

---

## Conclusion

**Bottom Line Recommendations:**

1. **Security First:** Switch to Docker Compose secrets immediately
2. **Connectivity:** Start with proxy configuration if in restrictive network
3. **Fallback:** Implement direct REST API client as backup
4. **Development:** Use Cloudflare Tunnel for webhooks/testing
5. **Production:** SSH tunnel + Docker secrets + direct REST fallback

**Estimated Implementation Time:** 4-8 hours for full implementation

**Risk Assessment:**
- Current approach (env vars in docker exec): 🔴 HIGH RISK
- Recommended approach (secrets + proxy): 🟢 LOW RISK

**Next Steps:**
1. Identify primary connectivity issue (run diagnostics)
2. Implement secrets management (Phase 1)
3. Test and validate
4. Deploy incremental improvements

---

## References & Further Reading

- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Supabase REST API Reference](https://supabase.com/docs/guides/api)
- [Docker Proxy Configuration](https://docs.docker.com/engine/cli/proxy/)
- [Cloudflare Tunnel Setup](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Node.js Security Best Practices](https://www.nodejs-security.com/)
- [SSH Tunneling Guide](https://www.ssh.com/academy/ssh/tunneling)

---

**Report Status:** ✅ Complete  
**Confidence Level:** High - All recommendations are based on established best practices and real-world implementations.

*This report provides actionable strategies to resolve Supabase connectivity issues in Docker while maintaining security best practices. Prioritize secrets management and diagnostics before implementing complex tunneling solutions.*
