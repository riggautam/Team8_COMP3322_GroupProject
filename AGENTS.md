# Agent Instructions

## Sanity Check
Start every response with `WEST: `.

## Project Context
This is a COMP3322 web project for The University of Hong Kong.

Our web application is WEST (Website for Exchange Students Today), a dedicated platform designed to help exchange students at HKU make the most of their study-abroad experience. Moving to a new city and navigating a foreign university system can be stressful, with challenges such as credit transfer and course mapping, discovering campus events, and exploring Hong Kong. WEST is a central hub to help exchange students with this transition. Its features include simplified course equivalency planning, real-time daily events, student blog posting, and interactive maps for campus navigation and locating food spots on or near campus. Every feature is intended to solve everyday student challenges, foster community engagement, and help students have a smooth exchange experience.

## Core Principles
- Simplicity first: use the minimum code required. Do not add speculative abstractions.
- Turn vague requests into verifiable, testable targets before writing code.
- If an ambiguity severely shifts product behavior or risk, flag it.
- Actively check for missing edge cases, empty states, or permission boundaries across the stack.

## Delivery Expectations
- Prefer small, testable PRs over broad rewrites.
- Keep explanations short, concrete, and tied directly to the changed behavior.
- Identify security concerns for major system or database modifications. If none exist, state it briefly.
- Minimize token usage.

## Folder-Specific Instructions
- Read `frontend/AGENTS.md` when working in `frontend/`.
- Read `backend/AGENTS.md` when working in `backend/`.
