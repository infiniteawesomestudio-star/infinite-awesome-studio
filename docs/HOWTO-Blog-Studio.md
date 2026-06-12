# How to run the IAS Blog Studio

**What it is:** a single-file local tool (`studio/blog-studio.html`) that scrapes AI news, redrafts stories in the IAS voice via Claude and publishes them to the site blog. All Claude calls route through the Cloudflare worker (`botId: blog-drafter`) so the API key never touches the browser. Your work state (queue, drafts, config) lives in browser localStorage, so always use the same browser.

## One-time setup

1. Open `studio/blog-studio.html` in your browser (double-click works, no server needed).
2. Go to the **Setup** tab and fill in:
   - **Worker token** · paste the current rotated `WORKER_TOKEN` (from the password manager). It is stored only in this browser's localStorage. Never put it in a file in the repo or on a command line. If calls return 401, the token is stale, get the current one.
   - **Worker URL** · pre-filled (`benebots-proxy.infiniteawesomestudio.workers.dev`), leave as is.
   - **Posts URL** · where the studio imports already-published posts from. Default points at `infiniteawesomestudio.com/blog-posts.json`. **Until DNS is live, change this to `https://infinite-awesome-studio.pages.dev/blog-posts.json`** or the import step fails.
   - **Fetch actor** · pre-filled (`data_xplorer/google-news-scraper-fast`). The worker only allows allowlisted actors, so changing this requires a worker update too.

Requires the worker to be live and the Anthropic account to have credits. Drafting calls are token-capped server-side.

## The publishing loop

1. **📰 Queue** · click Fetch to pull fresh AI/small-business headlines via the Apify actor (routed through the worker), or add a story by hand (headline, summary, source, URL). Items already in the queue, drafts or published posts are deduped by URL automatically.
2. **Draft** · pick a queue item and run the pipeline. The studio reads the source, generates angles, gathers supporting context, then writes the post. Each run saves a draft, nothing publishes automatically.
3. **Drafts** · review every draft before it ships. Edit the text, then mark it **approved**. Unapproved drafts never export.
4. **Import existing** · before your first export (and after publishing from another browser), click import on the Publish tab so previously published posts merge in. Skipping this drops old posts from the export.
5. **🚀 Publish** · exports `blog-posts.json`: approved drafts + imported published posts, deduped by slug, newest first. The file downloads to your Downloads folder.
6. **Ship it** · replace `landing/blog-posts.json` with the downloaded file, then deploy:

   ```bash
   npx wrangler pages deploy landing --project-name infinite-awesome-studio --commit-dirty=true
   ```

   The blog index (`landing/articles.html`) and the homepage Latest Insights card both read `blog-posts.json` directly, no rebuild needed. Commit the updated JSON afterward so the repo matches production.

## Gotchas

- localStorage is per-browser: switch machines and your queue/drafts/config do not follow. The published history survives via the import step.
- The export marks every approved draft `status: "published"`. If something should stay unpublished, leave it unapproved.
- Brand voice rules apply to drafts: never "powerful", "seamless", "innovative" or "game-changer". Review before approving, the model is not the editor of record. No Oxford comma, no em-dashes.
