# 30-Day Growth Plan — TRIAGE//44

A realistic, achievable roadmap continuing TRIAGE//44 beyond v1.0.0. Each day builds on the previous day's work. All days stay within the current architecture (vanilla HTML/CSS/JS, static JSON, localStorage, GitHub Pages) unless a day explicitly says otherwise and explains why.

## Days 1–5: Scenario Library Expansion
- **Day 1:** Audit the current 2-scenario dataset; draft a content template (fields, tone, difficulty guidelines) for new scenarios
- **Day 2:** Author 5 new Beginner scenarios following the template; validate against `loadScenarios()`'s required-field check
- **Day 3:** Author 5 new Intermediate scenarios; confirm the Intermediate difficulty filter now returns real results instead of the empty state
- **Day 4:** Author 5 new Advanced scenarios; same verification for the Advanced filter
- **Day 5:** Full regression test of difficulty filtering with real data in all four levels; update README's "known limitations" if scenario count changed materially

## Days 6–10: Content Depth
- **Day 6:** Author 10 more Beginner scenarios (target: broader topic coverage — phishing, malware, insider threat, cloud misconfig)
- **Day 7:** Author 10 more Intermediate scenarios
- **Day 8:** Review all explanations for consistency of tone and technical accuracy
- **Day 9:** Add a lightweight scenario ID/versioning convention so future scenario edits are traceable
- **Day 10:** Regression test the full expanded dataset end-to-end (still client-side, no schema change)

## Days 11–15: Analytics (Client-Side Only)
- **Day 11:** Design a simple "per-category accuracy" data structure (Malicious/Benign/Needs Investigation breakdown) derived from existing `answerLog`
- **Day 12:** Implement the calculation as a pure function (no new dependencies)
- **Day 13:** Surface per-category accuracy on the results screen
- **Day 14:** Add a simple "weakest category" callout using the same data
- **Day 15:** Test and verify with real answer data across multiple sessions

## Days 16–20: Accessibility Hardening
- **Day 16:** Perform actual screen-reader testing (NVDA or VoiceOver) — the one gap explicitly flagged as NOT VERIFIED through Day 60
- **Day 17:** Fix any issues found during screen-reader testing
- **Day 18:** Re-test with screen reader to confirm fixes
- **Day 19:** Run an automated accessibility scan (e.g. axe DevTools) as a supplementary check
- **Day 20:** Document accessibility testing results honestly in the README, replacing the "not yet performed" note

## Days 21–25: Content Contribution Workflow
- **Day 21:** Write a `CONTRIBUTING.md` documenting the scenario JSON schema
- **Day 22:** Add a simple validation script (still client-side/dev-time, e.g. a Node script run locally, not part of the deployed app) to check new scenario JSON before merging
- **Day 23:** Test the contribution workflow by adding one scenario through it end-to-end
- **Day 24:** Document the workflow in the README
- **Day 25:** Review and merge any first external scenario contributions if available

## Days 26–30: Polish & Second Release
- **Day 26:** Full regression test of the expanded application (all difficulty levels, all features)
- **Day 27:** Update all documentation (README, future-scope.md) to reflect actual v1.1.0 state
- **Day 28:** Prepare v1.1.0 release notes distinguishing what's new from v1.0.0
- **Day 29:** Deploy the updated version to GitHub Pages; verify the live version end-to-end
- **Day 30:** Create the v1.1.0 GitHub release/tag; reflect on what changed since v1.0.0

## When Would a Backend Be Introduced?
Not within this 30-day plan. A backend would only become justified if cross-device progress sync became an explicit goal — that's a deliberate architecture decision (see `future-scope.md`, 12-month horizon), not an assumed next step. Everything in this 30-day plan stays fully client-side.