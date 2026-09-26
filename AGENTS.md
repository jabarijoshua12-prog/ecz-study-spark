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

The study experience remains a frontend-only stateful prototype in `src/components/study-app.tsx`; keep demo progress and exam setup local until a persistent backend is requested, because the current scope explicitly excludes accounts and saved data.
The app uses a dark-only root theme and semantic tokens in `src/styles.css`; this keeps all screens consistent without a light-mode switch.
