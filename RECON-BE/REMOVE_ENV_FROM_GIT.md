# Remove .env (and secrets) from Git history

GitHub blocked your push because **RECON-BE/.env** (with the Groq API key) was committed. `.gitignore` only stops future commits; you must remove the file from the commit(s) that already contain it.

**Do this in the repo where you run `git push`** (likely the folder that contains `RECON-BE`).

## Step 1: Go to repo root

From your machine, open the repo that has the `dev` branch and the commit with the secret, e.g.:

```bash
cd /path/to/your/RECON-Solutions   # or wherever your repo root is (the folder that contains RECON-BE)
git checkout dev
```

## Step 2: Remove .env from the last commit (if the secret is in the latest commit)

If commit `2032133` is your **most recent** commit on `dev`:

```bash
git rm --cached RECON-BE/.env
git commit --amend --no-edit
git push --force-with-lease origin dev
```

If the secret is in an **older** commit, use Step 3 instead.

## Step 3: Remove .env from an older commit (interactive rebase)

Find how many commits back the bad commit is:

```bash
git log --oneline dev
```

Then rebase and drop or edit the commit that added `.env`. Example if it’s 2 commits back:

```bash
git rebase -i HEAD~2
```

In the editor, change `pick` to `edit` for the commit that added `.env`, save and close. Then:

```bash
git rm --cached RECON-BE/.env
git commit --amend --no-edit
git rebase --continue
git push --force-with-lease origin dev
```

## Step 4: Regenerate the Groq API key

The key that was in the repo is compromised. In the [Groq console](https://console.groq.com/), revoke/regenerate the key and put the new one only in a local `.env` (which is now ignored and will not be committed).
