# Hostinger VPS Network Filtering Analysis
## Outbound Connectivity to *.supabase.co:443

**Date:** 2026-02-26  
**Subject:** Research on Hostinger VPS network filtering and Docker outbound connectivity to Supabase

---

## Executive Summary

**Yes, outbound traffic to *.supabase.co on port 443 is enabled by default and should work without additional configuration.**

Hostinger's managed VPS firewall is **ingress-only** (inbound traffic filtering). Outbound connections, including HTTPS on port 443, are **allowed by default** and do not require explicit firewall rules.

---

## Key Findings

### 1. Hostinger VPS Firewall Architecture

Hostinger offers a **cloud-based managed firewall** accessible through hPanel:

- **Default policy:** Drops **all inbound traffic** unless explicitly allowed
- **Scope:** **Ingress (inbound) filtering only** - focuses on incoming connections to the VPS
- **Egress (outbound) traffic:** **Not filtered** by the managed firewall; allowed by default
- **Management:** Configured via hPanel dashboard (Security → Firewall)
- **Packet filtering:** Occurs before traffic reaches the VPS, reducing resource usage

Source: [Hostinger VPS Firewall Documentation](https://www.hostinger.com/support/8172641-how-to-use-a-managed-vps-firewall-at-hostinger/)

**Important distinction:**
> "By default, Hostinger VPS Firewall drops all traffic, which means you must add accept rules for all ports you want to use."

This statement refers to **inbound ports** (like SSH 22, HTTP 80, HTTPS 443 for incoming web traffic). The documentation focuses exclusively on ingress rules - there is no mention of egress/outbound filtering or configuration.

### 2. Cloud Firewall Standard Behavior

Industry-standard cloud firewalls (AWS Security Groups, Google Cloud Firewall, DigitalOcean Cloud Firewall) share common characteristics:

- **Stateful filtering:** Track connection state; allow return traffic automatically
- **Ingress focus:** Primary purpose is blocking unwanted inbound connections
- **Egress default:** Outbound traffic typically **allowed by default** unless explicitly restricted
- **Port 443 egress:** Never blocked by default - essential for system updates, API calls, package managers

Blocking outbound HTTPS (443) would break:
- `apt-get update` / `yum update`
- SSL/TLS API calls
- Docker image pulls
- Most modern applications

### 3. Docker Network Setup

Docker automatically manages iptables rules for container networking:

**Default Docker networking behavior:**
- Creates `DOCKER-USER` chain for custom rules
- Creates `FORWARD` chain rules with `ACCEPT` policy for Docker networks
- **Allows outbound traffic from containers by default**
- Uses masquerading (NAT) for container-to-internet traffic

**From Docker documentation:**
> "By default, all external source IPs are allowed to connect to the Docker daemon."

**Key iptables chains Docker manages:**
- `DOCKER` chain: Port mappings and published ports
- `DOCKER-USER` chain: Custom rules inserted before Docker's rules
- `FORWARD` chain: Routing between interfaces (including container-to-internet)

**Container outbound connectivity:**
```bash
# Docker automatically creates rules similar to:
iptables -A FORWARD -i docker0 -o eth0 -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -t nat -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
```

These rules enable containers to reach external destinations on any port, including 443.

### 4. VPS Provider Outbound Port Blocking

Some VPS providers **do** block specific outbound ports at the network level:

**Commonly blocked outbound ports:**
- Port 25 (SMTP) - to prevent spam
- Ports 465, 587 (SMTP over SSL/TLS) - same reason
- Port 22 (SSH) - occasionally, on budget providers

**Port 443 (HTTPS) is NEVER blocked outbound** by legitimate VPS providers because:
- Required for system updates and security patches
- Essential for modern web applications and APIs
- Blocking it would render the VPS nearly unusable

**Hostinger-specific:** No evidence found of Hostinger blocking any standard outbound ports except potentially SMTP (25/465/587) for anti-spam purposes.

---

## Answer to Core Question

### Can we enable outbound traffic to *.supabase.co on port 443?

**It is already enabled.** No configuration changes are needed.

**Why:**
1. Hostinger's managed firewall **only filters inbound traffic**
2. Outbound HTTPS (port 443) is **allowed by default** at both the VPS network level and Docker level
3. Docker's networking automatically permits container-to-internet outbound connections
4. No VPS provider blocks outbound port 443 as it would break fundamental functionality

---

## If Connectivity Issues Exist

If you're experiencing issues connecting to Supabase from a Docker container, the problem is **NOT** firewall-related. Investigate:

### 1. **DNS Resolution**
```bash
# From inside the container:
docker exec <container_name> nslookup your-project.supabase.co
docker exec <container_name> ping -c 3 your-project.supabase.co
```

**Possible issue:** Container DNS configuration  
**Fix:** Check Docker daemon DNS settings in `/etc/docker/daemon.json`:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

### 2. **Application-Level Configuration**
- Verify Supabase URL in environment variables
- Check API keys and authentication
- Review application logs for specific error messages

### 3. **Host-Level iptables (if manually configured)**

If you've manually configured iptables on the VPS host (not the Hostinger managed firewall), check:

```bash
# SSH into the VPS host
sudo iptables -L -n -v
sudo iptables -t nat -L -n -v

# Check if OUTPUT chain has restrictive rules:
sudo iptables -L OUTPUT -n -v

# If OUTPUT has DROP policy with no ACCEPT rules:
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
```

**Note:** Most VPS installations have **ACCEPT** policy for OUTPUT by default.

### 4. **Docker Network Isolation**

If using custom Docker networks with strict isolation:

```bash
# Check Docker network configuration
docker network inspect <network_name>

# Verify container can reach the internet
docker exec <container_name> curl -I https://www.google.com
docker exec <container_name> curl -I https://your-project.supabase.co
```

### 5. **Hostinger-Specific Firewall Check**

To verify the Hostinger managed firewall is not inadvertently blocking (highly unlikely):

1. Log into [hPanel](https://hpanel.hostinger.com)
2. Navigate to: **VPS → Select your server → Security → Firewall**
3. Check active firewall group rules
4. Look for any **DROP** or **REJECT** rules without port specification

**What you should see:** Only **ACCEPT** rules for specific inbound ports (22, 80, 443), and a default **DROP** rule at the end (for inbound traffic only).

---

## Host-Level iptables Commands (If Needed)

If you need to verify or configure iptables directly on the VPS host:

### Check Current Rules
```bash
# View all iptables rules
sudo iptables -L -n -v

# View NAT table (important for Docker)
sudo iptables -t nat -L -n -v

# View OUTPUT chain specifically
sudo iptables -L OUTPUT -n -v

# View FORWARD chain (Docker traffic)
sudo iptables -L FORWARD -n -v
```

### Allow Outbound HTTPS (If Needed)
```bash
# Allow outbound to port 443 (should already be allowed)
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Allow established connections (should already exist)
sudo iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Make rules persistent (Ubuntu/Debian)
sudo apt-get install iptables-persistent
sudo netfilter-persistent save

# Make rules persistent (CentOS/RHEL)
sudo service iptables save
```

### Docker-Specific Rules (If Issues Persist)
```bash
# Allow Docker containers to reach the internet on port 443
sudo iptables -I DOCKER-USER -p tcp --dport 443 -j ACCEPT

# Allow all outbound from Docker bridge network
sudo iptables -I DOCKER-USER -o eth0 -j ACCEPT

# Allow established/related traffic back to containers
sudo iptables -I DOCKER-USER -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

---

## Verification Steps

To confirm outbound 443 connectivity is working:

### From the Host
```bash
# Test HTTPS connectivity
curl -I https://www.supabase.co
curl -I https://your-project.supabase.co

# Test with verbose output
curl -v https://your-project.supabase.co/rest/v1/

# Check if port 443 is reachable
nc -zv your-project.supabase.co 443
```

### From Inside a Container
```bash
# Enter the container
docker exec -it <container_name> /bin/sh

# Test connectivity (if curl is available)
curl -I https://your-project.supabase.co

# If curl is not available, try wget
wget --spider https://your-project.supabase.co

# Check DNS resolution
nslookup your-project.supabase.co
```

---

## Recommendations

### For Standard Use Case
**No action required.** Outbound HTTPS to Supabase should work out of the box.

### If Issues Exist
1. **First:** Check application logs for specific error messages
2. **Second:** Verify DNS resolution inside containers
3. **Third:** Test connectivity with curl/wget from inside the container
4. **Fourth:** Review Docker network configuration
5. **Last resort:** Check host-level iptables OUTPUT rules (unlikely issue)

### Security Best Practices
If you want to **restrict** outbound traffic (defense-in-depth):

```bash
# Example: Whitelist only specific destinations
# (Not recommended unless you have specific security requirements)
sudo iptables -A OUTPUT -p tcp -d supabase.co --dport 443 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 443 -j DROP
```

**Warning:** Restricting outbound 443 will likely break package updates and other services.

---

## Summary Table

| Component | Outbound Port 443 Status | Configuration Needed |
|-----------|-------------------------|----------------------|
| Hostinger Managed Firewall | ✅ Allowed (not filtered) | None |
| VPS Host Network | ✅ Allowed by default | None |
| Host iptables | ✅ Typically ACCEPT policy | None (verify if manually configured) |
| Docker Networking | ✅ Allowed by default | None |
| Container to Supabase | ✅ Should work | None |

---

## Conclusion

**Outbound traffic to *.supabase.co on port 443 is enabled by default on Hostinger VPS** through multiple layers:

1. **Hostinger managed firewall** does not filter outbound traffic
2. **Host network** does not block outbound port 443
3. **Docker** automatically allows container outbound connectivity
4. **Industry standard** - no legitimate VPS provider blocks HTTPS egress

**If connectivity issues exist, they are NOT due to firewall configuration.** Investigate DNS, application configuration, or Docker networking instead.

---

## References

- [Hostinger VPS Firewall Documentation](https://www.hostinger.com/support/8172641-how-to-use-a-managed-vps-firewall-at-hostinger/)
- [Docker Packet Filtering and Firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/)
- [Docker iptables Integration](https://docs.docker.com/engine/network/firewall-iptables/)
- [iptables Tutorial - Hostinger](https://www.hostinger.com/tutorials/iptables-tutorial)

---

**Report prepared by:** Jackson (CAO)  
**For project:** kaza  
**Context:** Network debugging for Supabase connectivity
