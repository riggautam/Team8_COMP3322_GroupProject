# Backend Agent Instructions

Read the repository-root `AGENTS.md` first and follow it along with these backend-specific practices.

## Node.js and Express
- Follow standard, current Node.js and Express practices. Keep modules focused and code straightforward; avoid speculative abstractions.
- Prefer `async`/`await` for asynchronous work. Handle rejected promises and errors explicitly; use Express's error-handling conventions and return appropriate HTTP status codes and response shapes.
- Validate and normalize untrusted input at the boundary. Enforce authorization and ownership checks wherever data access requires them.
- Keep secrets and environment-specific configuration out of source control. Never log credentials, tokens, or sensitive user data.
- If database access is introduced, use parameterized queries or the database library's safe query APIs, and handle missing records, constraints, and failures explicitly.
- Use middleware consistently for shared concerns such as validation, authentication, and error handling, without layering middleware that does not add value.
- Avoid blocking the event loop for routine request work. Clean up resources and background work deliberately, and make failures observable through appropriate logging.
- Consider security implications for API, authentication, and database changes, including input validation, access control, and safe error responses.
