# Verification Rules

## Unit of Work

- Audit one prefecture at a time
- Check every city in scope for that prefecture

## What To Verify

- incumbent mayor name
- term start
- term end
- term note when needed
- investigation date
- source URLs
- next election date when the current term ends within 30 days or has already ended

## Date Rules

- Use `YYYY-MM-DD` when exact date is available
- If a date is inferred or backfilled, explain that in `note`
- Record `investigated_at` for the city record
- Record `checked_at` for each source
- If `term_end` is earlier than the investigation date, check whether the mayoral election has already been held and write that date in `note`
- If `term_end` is within 30 days after the investigation date, check the official election notice pages and write the next mayoral election date in `note`

## Judgment Rules

- Use `confirmed` only when the adopted value is supported by official sources
- Use `conflict` when official sources disagree or do not reconcile cleanly
- Use `missing_source` when key official evidence is not found
- Use `needs_review` when the record is close but still incomplete

## Source Rules

- Prefer primary official pages over summaries
- Keep the actual URL that was checked
- Record which fields each source supports

## Source Priority

- Start from the prefectural election commission pages, rosters, term-expiry lists, and election schedule pages before city profile pages
- For `mayor_name`, prioritize official election results, opening results, or winner lists over profile pages
- For `term_end`, prioritize official term-expiry lists or election schedule pages
- For `term_start`, prioritize explicit inauguration dates, mayor schedules, inauguration ceremony pages, or official pages that state the start date
- Use profile pages as supporting evidence for reading, career, term count, and identity confirmation, not as the first source for post-election updates

## Tie-Break Rules

- When an older mayor profile and a newer official election result disagree, prefer the newer official election result
- When a profile page is stale but the election management pages have been updated, treat the election management pages as authoritative for the current term
- When `term_start` is not explicitly stated but the previous term end is official and the new election result is official, you may backfill the new term start as the next day
- When backfilling `term_start`, note clearly that it was derived from the official previous term end plus the official election result

## Start-of-Audit Checklist

- First fix the municipality scope from an official prefectural or municipal list before checking any mayor records
- Open the prefectural election commission page first and secure the prefecture-level roster, term-expiry list, and election schedule before checking individual cities
- Before reading profile pages, check whether the city had a recent mayoral election within the last several months
- For recently elected or re-elected mayors, open election-result pages and term-expiry pages before the mayor profile page
- Check the city election commission index or election news list, not only the general city top page
- If a city page set looks stale, search for official PDFs, opening-result pages, schedule pages, and notice pages in the same official domain
- If `term_end` is today or in the past, check the official election-result or election-notice pages before treating the record as current
- If `term_end` is within the next 30 days, check the official election-notice and candidate pages before closing the review

## Lessons Applied From Gunma

- Stale mayor profiles are common right after an election; do not treat them as the default source for the current incumbent
- Election-result pages are often published faster than mayor-profile pages and should be treated as the first source for incumbent confirmation
- Official term-expiry lists can update after the election and are often the fastest way to confirm the new `term_end`
- Inauguration clues may live in mayor schedules, inauguration remarks, or photo reports rather than profile pages
- When the evidence is split across multiple official pages, prefer the newest official page for the changed fact and use the older official page only for unchanged background facts

## Lessons Applied From Fukuoka

- A prefectural `mayor roster` may list the incumbent's first assumption date rather than the current term start
- If a roster start date predates the current term but the term-expiry list is official, use the official term end and the standard four-year mayoral term to backfill the current `term_start`
- When the prefectural roster notes that it uses the winner's legal name, check the city profile page or the election-result page before changing the public-facing `mayor_name` on the site
