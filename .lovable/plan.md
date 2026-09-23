# ECZ AI Study App

## Goal
Build the mobile-first ECZ study experience shown in the references, with personalized onboarding, a confirmed weekly plan, a guided AI Tutor, Exam Mode, and saved student progress.

## Product flow
1. **Account** — Email sign-up, sign-in, password recovery, and a student profile with display name.
2. **Baseline Check** — Ask for the latest Mathematics, Physics, Chemistry, and Biology marks in a clear report-card table. Save only after **Confirm**.
3. **Study Availability** — Ask how many hours and which weekly times the student can study, using the supplied sentence as low-opacity guidance.
4. **Study Rhythm** — Generate an editable weekly calendar that prioritizes weaker subjects, spreads the workload across available days, and prevents duplicate subjects in one slot. Students can replace a subject, move time blocks, and save only with **Confirm routine**.
5. **Home** — Match the supplied visual language. Replace the main banner with **The Exam**, linking to Tutor Exam Mode. Show a **Due today** heading and three scheduled subjects, remove “Jump back in,” rename “Browse subjects” to “Subjects,” remove the extra subject list, and remove Revise from navigation.
6. **Subjects** — Recreate the subject list for Mathematics, Biology, Physics, Chemistry, and English with syllabus topic navigation.
7. **Past Papers** — Recreate subject/year selection and practice launch states.
8. **Settings** — Let students reopen **Baseline Check** and **Study Rhythm**; changes are staged, AI recalculations appear as a preview, and the database updates only after confirmation.

## AI Tutor
- Build one saved, guided conversation rather than separate user-created threads.
- Greet the student by name and open with today’s scheduled subjects.
- Match a typed classroom topic to the closest official syllabus topic, then offer subtopics as selectable buttons.
- Implement the **Present** loop: summary, collapsible “written it down” checkpoint, ECZ-style test, and Socratic correction.
- Implement the **Review Queue**: graduate completed topics, hide it for true early users until prior topics exist, and prefill earlier syllabus topics for late starters.
- Transition between topics and subjects with a staggered fade/slide clean-slate animation; finish the daily plan with a positive completion state.
- Use real streamed Lovable AI responses and preserve the full conversation context.

## Exam Mode
- Add a subtle glowing Tutor toggle.
- Collect the exam date, identify covered high-yield topics, collect Low/Medium/High confidence, rank low-confidence topics first, and create an Ebbinghaus-based review queue through the exam date.
- While active, pause the normal Present/Queue flow and focus daily sessions on the exam queue.
- Keep exam notifications out of this release, as requested.

## Data and security
- Enable Lovable Cloud for accounts, saved profiles, marks, availability, routines, syllabus progress, review queue, exam plans, and tutor history.
- Add row-level security so every student can access only their own records.
- Keep AI credentials and prompts server-side; validate all saved changes and AI requests.
- Seed a focused ECZ syllabus dataset sufficient for the demonstrated subjects, topic matching, subtopic selection, and Past Papers UI.

## Visual system and interaction
- Faithfully reproduce the warm off-white background, deep ECZ green, white cards, compact rounded controls, bold headings, and fixed mobile navigation from the references.
- Make layouts scale cleanly from mobile to larger screens without changing the mobile-first hierarchy.
- Use a 300ms accordion collapse for summaries, staggered fade/slide transitions when clearing phases, and an 800ms green-border flash before completed dashboard subjects scale away.
- Build the chat surface from AI Elements primitives with readable markdown, reasoning/loading states, and a focused composer.

## Technical details
- Use TanStack Start routes for `/auth`, onboarding steps, `/home`, `/subjects`, `/papers`, `/tutor`, and `/settings`; protected pages live behind the managed account gate.
- Use server functions for saved student data and a streaming `/api/chat` route for Tutor responses.
- Use `openai/gpt-6-astra` through Lovable AI with streamed reasoning and status-aware errors.
- Add unique page metadata and verify the complete account → onboarding → confirmed plan → daily tutor → exam mode flow on mobile and desktop.
