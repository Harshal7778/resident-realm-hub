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

# Architecture notes

- All data persists in localStorage via `src/lib/storage.ts` (keys `sm.*`); services in `src/services/` are the only writers. No backend is connected.
- Charts in reports use a dependency-free CSS bar chart (`src/features/reports/ReportChart.tsx`); recharts conflicts with React 19 in this Vite setup ("Invalid hook call"), so never reintroduce it.
- `/reports` is a route family (`reports.tsx` layout + `reports.index.tsx` + `reports.$report.tsx`); members may open only the contributions report and only their own house rows.
- Demo logins and the OTP flow live in `authService`; never clear all `sm.*` keys between test logins — only `sm.session` (overrides/audit logs must survive).
