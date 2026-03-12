# Kaza TLS/Env Repair Report

## Problem Summary
The `service_role` key is rejected as "Invalid API key" from within the Docker container, despite working locally. This suggests the key itself is valid, but the transmission or interpretation of the key inside the container is flawed.

## Potential Root Causes

### 1. Environment Variable Corruption (Most Likely)
When passing environment variables to Docker (especially via `docker run -e` or `.env` files), hidden characters often creep in.

*   **The Issue:** A trailing newline (`\n`) or carriage return (`\r`) in the environment variable.
*   **Why it fails:** API clients (like `supabase-js` or raw `fetch`) treat the key string literally. `Key123` != `Key123\n`.
*   **Diagnosis:**
    Inside the container, run:
    ```bash
    # Print the key with cat -A to reveal hidden characters (like ^M or $)
    echo "$SUPABASE_SERVICE_ROLE_KEY" | cat -A
    
    # Or use node to inspect exact length and content
    node -e 'console.log(JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY))'
    ```
    *If you see `\r` or extra spaces inside the quotes, that is the culprit.*

### 2. TLS/SSL Trust Chain Issues
If the container is a stripped-down Debian/Alpine image, it might lack the root CAs needed to trust the Supabase (or upstream) API endpoint.

*   **The Issue:** Node.js cannot verify the SSL certificate of the API endpoint.
*   **Symptoms:** Usually manifests as `CERT_HAS_EXPIRED`, `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, or a connection drop. However, *some* API gateways might return generic 400/401 errors if the handshake fails in a specific way, though less common for "Invalid API Key" specifically.
*   **Diagnosis:**
    Run this Node.js snippet inside the container to test the connection explicitly:
    ```bash
    node -e '
    const https = require("https");
    https.get("https://your-project.supabase.co", (res) => {
      console.log("StatusCode:", res.statusCode);
      console.log("Headers:", res.headers);
    }).on("error", (e) => {
      console.error(e);
    });
    '
    ```
*   **Fix:**
    Ensure `ca-certificates` is installed and updated.
    ```bash
    apt-get update && apt-get install -y ca-certificates && update-ca-certificates
    ```

### 3. Node.js `https` Module & Custom CAs
If the environment uses a transparent proxy or corporate interceptor, Node.js needs to be told to trust that custom CA.

*   **Diagnosis:** Set `NODE_TLS_REJECT_UNAUTHORIZED=0` (TEMPORARY TEST ONLY) to see if the error vanishes. If it works with this set, it's definitely a certificate trust issue.

## Recommended Action Plan

1.  **Inspect the Key:** Run the `cat -A` or `JSON.stringify` check first. This is the most common cause of "Invalid Key" errors when moving between OSs (Windows/Linux) or copy-pasting into `.env` files.
2.  **Verify Connectivity:** Run the simple Node.js `https.get` script to confirm the container can actually reach the endpoint without TLS errors.
3.  **Sanitize Env Vars:** If using a `.env` file, ensure it uses LF (Unix) line endings, not CRLF (Windows).

## Diagnosis Commands (Copy-Paste)

Execute this inside your running container:

```bash
echo "--- CHECKING ENV VARS ---"
echo -n "Key length: "
node -e 'console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : "Unset")'
echo "Key content inspection:"
node -e 'console.log(JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY))'

echo "--- CHECKING TLS CONNECTION ---"
node -e '
const https = require("https");
// Replace with your actual URL
const url = process.env.SUPABASE_URL || "https://google.com"; 
console.log(`Connecting to ${url}...`);
const req = https.request(url, { method: "HEAD" }, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log("TLS Cert Validated.");
});
req.on("error", (e) => {
    console.error("Connection Error:", e.message);
    if (e.code) console.error("Code:", e.code);
});
req.end();
'
```
