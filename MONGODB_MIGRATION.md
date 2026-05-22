# AgroMitra MongoDB Migration

This project now uses MongoDB, Mongoose, local uploads, and JWT authentication.

Completed foundational migration work:

- Added MongoDB + Mongoose setup
- Added MongoDB models for User, Product, Cart and Order
- Added centralized MongoDB connection
- Added environment template for MongoDB

Remaining integration points to test manually:

- Frontend auth replacement
- File upload storage migration
- OTP + Aadhaar verification flows
- Cart synchronization
- Order + payment verification

No existing frontend files were deleted so current functionality structure remains intact.
