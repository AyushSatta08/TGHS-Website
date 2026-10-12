# Internship progress — TGHS ATS

## Prototype workflow review

- **Authentication:** not present in the starter or this prototype. The current API is open and is suitable only for local demonstration data. Add authentication, authorization, and audit logging before using real applicant information.
- **Data entry:** candidate creation requires a name, valid email, and role. Notes are optional. Browser validation improves the form experience; the server and Mongoose schema validate again because client checks are not a security boundary.
- **API payload:** create accepts `{ "name", "email", "role", "notes" }`; status begins as `New`. Updates accept only `status` and `notes`.
- **Edge cases handled:** missing or invalid fields, unknown status values, invalid record IDs, missing records, invalid JSON, failed API/database connection, empty results, search filtering, request loading, and mutation feedback.
- **Data model:** applications carry creation and update timestamps. Email is normalized to lowercase. Duplicate-email policy is left open because one person may apply to more than one role; a production system should define whether uniqueness is per role or per candidate profile.

## MERN integration overview

React owns the form, search, filters, and loading/error/success states. It calls the Express JSON API. Express validates the allowed fields and uses the Mongoose `Application` model for MongoDB reads and writes. The database connection is established before the API begins listening, so the UI receives a clear connection failure rather than silently operating without persistence.

## Consolidated progress

- Added a responsive ATS dashboard with candidate entry, search, status filters, pipeline counts, status updates, and removal.
- Added an Express API and Mongoose schema for application records.
- Added environment-based MongoDB and client-origin configuration.
- Added setup instructions and a merge-conflict practice summary.
- Authentication, role permissions, automated checks, and deployment configuration remain follow-up work. The repository did not include the original prototype or a test repository, so the workflow review is based on this scaffold.
