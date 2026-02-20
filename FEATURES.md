# IAAI Application Features Overview

Here is a comprehensive summary of all the features currently implemented and working in the application, categorized by user roles:

## 👑 1. Super Admin Features
*   **Central Authentication:** Logs in securely at `/login`.
*   **Seller Management:** Can create new Sellers (assigning passwords, company names, and slugs).
*   **One-Click Login:** Can instantly log in as any Seller to audit their account without needing their password.
*   **Global Feedback View:** Can view feedback submitted directly to the Super Admin's master QR code.

## 🏢 2. Seller Features
*   **Targeted Authentication:** Logs in at `/login` with credentials provided by the Super Admin.
*   **Client Management:** Can create and manage multiple tracking sub-clients.
*   **Company QR Generator:** Can customize their own Seller QR code (change color, upload an overlay center logo) and download it in PNG, SVG, or PDF formats to place on physical desks/menus.
*   **One-Click Login:** Can instantly "Login as Client" from the dashboard to configure a client's account for them.
*   **Feedback Moderation:** Views all negative feedback caught by their own Seller QR Code *as well as* feedback caught by all of their Clients' QR codes. They can permanently delete feedback if resolved.

## 🧑‍💼 3. Client Features
*   **Self-Service Authentication:** Logs in at `/login` with credentials provided by the Seller.
*   **Personal QR Generator:** Like Sellers, Clients have their own separate QR generator that targets their specific Google Review link. They can fully customize the colors/logos independent of the Seller.
*   **Private Feedback View:** Sees *only* the negative feedback submitted through their specific QR code. Cannot see feedback belonging to the Seller or other Clients. They can also delete their own feedback.
*   **Profile Management:** Can update their display name, password, phone number, and their target Review URL (e.g., their Google Maps link).

## 🤳 4. Public Review Scanner (The QR Experience)
*   **Dynamic Routing:** When a customer scans a QR code (going to `/review/client-name`), the system dynamically fetches the correct company's branding and data.
*   **Smart Rating Filter:**
    *   🌟 **4 or 5 Stars:** The system automatically redirects the user straight to the public Review URL (e.g., Google Maps, Zomato) to leave a positive public review.
    *   ⭐ **1 to 3 Stars:** The redirect is blocked. Instead, the user is presented with a private internal feedback form to vent their frustrations privately.
*   **Media Uploads:** Angry customers can upload photo evidence (images/videos) alongside their negative written feedback.
*   **General Suggestions:** For 4-5 stars, the system provides standard, professional default text (e.g., *"Great service! Highly recommended"*) that the user can easily copy.

## 🔒 5. Backend & Security
*   **Firebase Realtime Database:** All data is synced live. Feedback deletes and profile updates happen instantly on the screen.
*   **Database Indexing:** Fast Firebase searching enabled via `.indexOn` rules for emails and URL slugs, ensuring the login system never slows down. 
