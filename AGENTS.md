<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules
- Study rules (quotas, routine distribution, strikes, dates) live as pure functions in `src/lib/study-logic.ts` with tests beside them; UI imports them instead of hardcoding numbers, so rule changes stay in one tested place.
- Questions come from templates in `src/lib/question-bank.ts` that vary numbers, wording and option order per seed; a later backend should keep this shape (`Question`) so screens don't change.
- The app is frontend-only for now: state persists to localStorage via `useStudyStore`; swap that hook for server calls when the backend is added.
- The whole app is one route (`/`) driven by a view state in `src/components/study-app.tsx`; screens live in `src/components/study/`.
