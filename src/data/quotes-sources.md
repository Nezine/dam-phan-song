# Sources — quotes + real-life challenges (Đàm Phán Sống)

All sources accessed 2026-11-14. Every quote below was checked against the cited source; wording is the verified wording, not the popular paraphrase. Where the popular version differs, the difference is noted.

## Quotes — verification notes

- **q01 John F. Kennedy** — https://en.wikiquote.org/wiki/John_F._Kennedy — Wikiquote, Sourced: Inaugural Address, 20 January 1961; *The Public Papers of the Presidents of the United States: John F. Kennedy, 1961*, p. 2.
- **q02 Dale Carnegie** — https://quotepark.com/quotes/1271098-dale-carnegie-you-can-make-more-friends-in-two-months-by-becomin/ — Wikiquote (Friendship) lists this line under Unsourced; QuotePark traces it to *How to Win Friends and Influence People* (1936), p. 52 (1998 ed.). Wording matches across multiple independent sources. Note: a variant exists ("You can close more business in two months...") — not used.
- **q03 Warren Buffett** — https://quotle.info/who-said/price-is-what-you-pay-value-is-what-you-get/ — Wikiquote, 2008 Chairman's Letter: "Long ago, Ben Graham taught me that 'Price is what you pay; value is what you get.'" The short form is the listed variant. Buffett himself credits the line to his teacher Benjamin Graham — do not present it as Buffett's invention.
- **q04 Stephen R. Covey** — http://azquotes.com/quote/367105?ref=listening-and-hearing — Habit 5 title, *The 7 Habits of Highly Effective People* (1989); AZ Quotes cites the 2013 edition, p. 267, Simon and Schuster. The book's own summary sentence: "Seek First to Understand, Then to Be Understood."
- **q05 Sun Tzu** — https://en.wikiquote.org/wiki/Sun_Tzu — Wikiquote, *The Art of War* ch. III, Giles translation: "For to win one hundred victories in one hundred battles is not the acme of skill. To subdue the enemy without fighting is the acme of skill." The popular line "The supreme art of war is to subdue the enemy without fighting" is a modern condensation of this passage — NOT used here.
- **q06 Zig Ziglar** — https://en.wikiquote.org/wiki/Zig_Ziglar — Wikiquote, *Secrets of Closing the Sale* (1984): "You can get everything in life you want if you will just help enough other people get what they want." The popular version drops "enough" and swaps "get" for "have" — NOT used here.
- **q07 Winston Churchill** — https://en.wikiquote.org/w/index.php?title=Winston_Churchill&oldid=151562 — Wikiquote, Sourced (Post-war years): remarks at a White House luncheon, 26 June 1954. Exact words are not known (the luncheon was closed to reporters); this is the commonly cited version per *The New York Times*, 27 June 1954. Biographer Sir Martin Gilbert noted Churchill may actually have said "Meeting jaw to jaw is better than war."
- **q08 Seneca** — https://quotle.info/who-said/we-suffer-more-often-in-imagination-than-in-reality/ — *Moral Letters to Lucilius*, Letter 13 ("On Groundless Fears"), §4, trans. Richard M. Gummere (Loeb, 1917–25). Full sentence: "There are more things, Lucilius, likely to frighten us than there are to crush us; we suffer more often in imagination than in reality." The short form used here is the exact second half. Latin: "Plura sunt, Lucili, quae nos terrent quam quae premunt, et saepius opinione quam re laboramus." Wikiquote lists it in the sourced section.
- **q09 Benjamin Franklin** — https://en.wikiquote.org/wiki/Benjamin_Franklin — *The Autobiography of Benjamin Franklin*, Part III (resumed August 1788). Franklin repeats the line as "an old maxim I had learned" — he does NOT claim to originate it. The psychological effect is named after him (Ben Franklin effect).
- **q10 Benjamin Franklin** — https://en.wikiquote.org/wiki/Benjamin_Franklin — Wikiquote, Sourced: *Poor Richard's Almanack*, 1738: "Either write things worth reading, Or do things worth the writing." Quote Investigator confirms Franklin published it in the 1738 almanac, building on Thomas Fuller's 1727 adage — mixed lineage, but Franklin's 1738 publication is verified.

## Dropped — could not verify, excluded on purpose

- **Charlie Munger, "Show me the incentive and I'll show you the outcome"** — DROPPED. No exact primary wording exists; sources (e.g. buffettmungermerch.com, mungerarchive.com) call it a paraphrase/distillation of "The Psychology of Human Misjudgment" (1995), with wording varying across editions.
- **Nelson Mandela, "If you talk to a man in a language he understands, that goes to his head..."** — DROPPED. Quote Investigator found the first attribution only in 2001, with no evidence Mandela ever said it. His real line (1992, in conversation with Richard Stengel) is about Afrikaans: "when you speak Afrikaans, you know you go straight to their hearts."
- **Warren Buffett, "It takes 20 years to build a reputation and five minutes to ruin it"** — DROPPED. Quote Investigator traces the saying to a Texas newspaper in 1891, before Buffett was born (1930); only indirect evidence (son Howard's recollection, USA Today 1991) links it to Buffett.

## Challenges

Original content, written for this app (no source needed). Each is a small, safe, respectful real-life action under 5 minutes, tied to one room.

## Wiring (for Milo / Migga)

Win card shows 1 random quote from `src/data/quotes.json` (same slot as the "Câu vàng" mechanism #3 in `retention/RETENTION-SPEC.md` — quotes.json is the fallback pool when no technique applies; always keep the author line visible). HomeScreen shows 1 "Thử thách hôm nay" per day, picked by date from `src/data/challenges.json`. Data-only, no new dependencies.
