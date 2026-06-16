# 6-7 Wish — Complete Web Project
## Milkox Group LLC | www.sixsevenwish.com

---

## FOLDER STRUCTURE

```
sixsevenwish/
│
├── index.html              ← Main experience (hero, well, form, interaction)
├── gracias.html            ← Success page (fires Meta Pixel Purchase event)
├── privacy-policy.html     ← Privacy Policy
├── terms-of-service.html   ← Terms of Service + Refund Policy (combined)
├── refund-policy.html      ← Refund Policy (standalone)
│
├── sadmin/
│   └── index.html          ← Admin dashboard (login + wish management)
│
├── api/
│   └── save-wish.php       ← PHP API endpoint to save wishes to MySQL
│
└── database/
    └── schema.sql          ← MySQL 8 schema (wishes table + admin_users)
```

---

## SETUP CHECKLIST

### 1. Replace Placeholders

In `index.html`:
- `PAYPAL_CLIENT_ID` → Your PayPal Client ID from developer.paypal.com
- `META_PIXEL_ID` → Your Meta Pixel ID from Meta Business Suite
- `GA_MEASUREMENT_ID` → Your Google Analytics 4 Measurement ID

In `gracias.html`:
- `META_PIXEL_ID` → Same as above
- `GA_MEASUREMENT_ID` → Same as above

### 2. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

Then update `api/save-wish.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sixsevenwish');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

### 3. Admin Password

Update the default admin password in `sadmin/index.html` (line with `wish2026!`).
For production, move auth to server-side PHP session.

### 4. PayPal

- Create a PayPal Developer account at developer.paypal.com
- Create an app and get your Client ID
- Replace `PAYPAL_CLIENT_ID` in index.html

---

## CONTRIBUTION LEVELS

| Level   | Amount | PayPal Description          |
|---------|--------|-----------------------------|
| Hope    | $3.00  | 6-7 Wish - Hope Wish ($3)   |
| Dream   | $5.00  | 6-7 Wish - Dream Wish ($5)  |
| Destiny | $12.00 | 6-7 Wish - Destiny Wish ($12) |

---

## TECHNOLOGY STACK

- HTML5 + Vanilla JavaScript
- GSAP 3.12.5 (animations)
- Google Fonts (Cinzel Decorative, Cinzel, Crimson Text)
- PayPal JS SDK
- PHP 8.3 (API endpoint)
- MySQL 8 (database)
- Meta Pixel + Google Analytics 4

---

## DISCLAIMER

This website is a digital entertainment experience.
No specific outcomes are guaranteed.
This service does not constitute professional advice of any kind.
Operated by Milkox Group LLC — 1 North Miami Beach, FL 94043, United States.
support@sixsevenwish.com
