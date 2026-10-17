# Page Documentation: Admin Panel (`AdminPanel/index.html`)

> [!NOTE]
> The Admin Panel (`AdminPanel/index.html`) is a secure, standalone management portal for article publishing, category configuration, analytics monitoring, and visitor tracking.

---

## 1. Page Layout & ASCII Wireframe

```
+-----------------------------------------------------------------------------------+
|  STEP 1: GOOGLE SIGN-IN CONTAINER (#loginContainer)                                |
|  +-----------------------------------------------------------------------------+  |
|  |  MCHESS Admin Panel Login                                                   |  |
|  |  [ Button: Sign in with Google (Authorized Admin Email Only) ]              |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
|  STEP 2: 16-DIGIT SECURITY PIN UNLOCK FORM (#firestorePinForm)                    |
|  +-----------------------------------------------------------------------------+  |
|  |  Enter 16-Digit Admin Security PIN                                          |  |
|  |  [ [••••] — [••••] — [••••] — [••••] ]                                       |  |
|  |  [ Button: Unlock Panel ]   [ Button: Cancel & Logout ]                     |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
|  STEP 3: MAIN ADMIN DASHBOARD (#adminDashboard)                                   |
|  +-----------------------+-----------------------------------------------------+  |
|  | SIDEBAR NAVIGATION    | DASHBOARD CONTENT VIEW                              |  |
|  | - Dashboard           | +--------------------+  +-------------------------+ |  |
|  | - Analytics           | | Total Visitors     |  | Active Blog Posts       | |  |
|  | - Blogs (CRUD)        | +--------------------+  +-------------------------+ |  |
|  | - Blog Categories     |                                                     |  |
|  | - Messages            | ARTICLE MANAGER TABLE (#blogsTableBody)             |  |
|  | - Logout              | [ Title | Category | Release Date | Actions ]       |  |
|  +-----------------------+-----------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Three-Layer Security & Authentication Flow

```mermaid
graph TD
    Start["User Opens AdminPanel/index.html"]
    
    GoogleBtn["Click 'Sign in with Google'"]
    GoogleAuth["Firebase Google Auth Provider"]
    EmailCheck{"Is Email == ALLOWED_ADMIN_EMAIL?"}
    
    RejectEmail["Sign Out & Show Error: 'Unauthorized Account'"]
    
    PinForm["Show 16-Digit Security PIN Form"]
    EnterPin["User Enters 16-Digit PIN (4-4-4-4)"]
    ComputeHash["Compute Salted SHA-256 Hash via Web Crypto API"]
    
    FetchConfig["Fetch Firestore doc 'admin_settings/auth_config'"]
    HashCheck{"Does Hash Match Firestore pin_hash?"}
    
    UnlockDashboard["Grant Access & Display Dashboard (#adminDashboard)"]
    LogFailure["Record Failed Attempt in Firestore 'admin_login_logs'"]
    CheckLockout{"Failed Attempts >= 3?"}
    Lockout["Apply 24-Hour IP Lockout"]
    
    Start --> GoogleBtn
    GoogleBtn --> GoogleAuth
    GoogleAuth --> EmailCheck
    EmailCheck -->|"No"| RejectEmail
    EmailCheck -->|"Yes"| PinForm
    
    PinForm --> EnterPin
    EnterPin --> ComputeHash
    ComputeHash --> FetchConfig
    FetchConfig --> HashCheck
    
    HashCheck -->|"Yes"| UnlockDashboard
    HashCheck -->|"No"| LogFailure
    LogFailure --> CheckLockout
    CheckLockout -->|"Yes"| Lockout
```

---

## 3. Key Modules & Source References

- **HTML View**: [`AdminPanel/index.html`](../../AdminPanel/index.html)
- **Authentication & Security Engine**: [`AdminPanel/js/auth.js`](../../AdminPanel/js/auth.js)
- **Dashboard & CRUD Logic**: [`AdminPanel/js/app.js`](../../AdminPanel/js/app.js)
- **Analytics Visualization**: [`AdminPanel/js/analytics.js`](../../AdminPanel/js/analytics.js)
- **Stylesheets**: [`AdminPanel/css/admin-style.css`](../../AdminPanel/css/admin-style.css)

---

## 4. Open Source Security & Hardening Checklist

> [!IMPORTANT]
> The Admin Panel is safe to publish in an open-source repository because:
> 1. **No Plaintext Passwords in Source**: The PIN is never hardcoded. Only its salted SHA-256 hash is verified against Cloud Firestore at runtime.
> 2. **Cloud Firestore Rules Protection**: `admin_settings` and `visitor_analytics` collections are protected by Firestore security rules requiring authenticated admin credentials.
> 3. **Automatic Cache Invalidation**: Saving or deleting blogs automatically clears `localStorage` client caches (`mchess_blogs_cache`, `mchess_categories_cache`).
