# Why your Claude file never shows up in their Figma

Code Connect was set up so Dev Mode shows the **real component** from the app. The file from Claude is a **second build** of the same screen. Developers collaborate on the frame. They ship from the repo. The chat file is a third place, so it stays unused.

Read the maps in order. The caption under each one is the talk-through.

Maps 1–6 are the loop while Figma is still the shared room. Maps 7–10 are the loop after the code library has replaced it. The library already exists. It was built from the Figma design system. Figma is the piece leaving.

---

## 1. Same screen, two sources

```mermaid
flowchart LR
  screen["One screen"]
  screen --> yours["Your source"]
  screen --> theirs["Their source"]
  yours --> y1["Claude file"]
  yours --> y2["Components already drawn in code"]
  yours --> y3["Looks finished"]
  yours --> y4["Lives in chat or a side folder"]
  theirs --> t1["Figma frame"]
  theirs --> t2["Comments and bug threads"]
  theirs --> t3["Dev Mode"]
  theirs --> t4["Code Connect snippet"]
  theirs --> t5["App repo"]
```

You are looking at a finished file. They are looking at the frame. Dev Mode is where they answer “which of our components is this?” The snippet there is written to match the design system in the repo. Your file never enters that panel, so it is invisible in the place they already work.

---

## 2. The catch

```mermaid
flowchart LR
  catch["The catch"]
  catch --> points["Code Connect points"]
  catch --> again["Claude builds again"]
  catch --> fork["Complete means a fork"]
  catch --> glue["Product glue sits in the repo"]
  catch --> bugs["Bugs already have a home"]
  points --> p1["Figma component"]
  points --> p2["Maps to an import that already exists"]
  points --> p3["Snippet appears in Dev Mode"]
  points --> p4["Updated when that component changes"]
  again --> a1["New button, table, modal"]
  again --> a2["New prop names"]
  again --> a3["Own colors and spacing"]
  again --> a4["Complete on its own"]
  fork --> f1["The product keeps one shared button"]
  fork --> f2["A full copy is a second button"]
  fork --> f3["Token and focus changes miss the copy"]
  fork --> f4["Two UIs to maintain"]
  glue --> g1["Data and permissions"]
  glue --> g2["Loading, empty, error"]
  glue --> g3["Translations"]
  glue --> g4["Tests and tokens"]
  bugs --> b1["Comment on the frame"]
  bugs --> b2["Ticket points at the frame"]
  bugs --> b3["Inspect shows spacing and the snippet"]
```

Code Connect is a **pointer**. A published Figma component is tied to a snippet such as `import { Button } from "@company/design-system"`. When someone selects that button in Dev Mode, they see that snippet. The mapping lives with the design system. It updates when the real component changes.

The Claude file **builds the screen again**. “Components in place” means the page can run by itself: its own button, its own table, its own spacing. That self-contained file is a fork. The product is trying to keep a single button so a token change, a focus ring, or a loading state happens once. A second button in a side file misses that change, and someone would have to maintain both.

The rest of an enterprise screen is glue that lives in the repo: data, permissions, empty and error states, translations, tests. Developers rebuild that glue from the library, so a visually finished file still gets rewritten.

Bugs already have a home on the frame. A comment or a ticket can point at the same picture the whole team sees. The chat transcript is not that record.

---

## 3. What the words mean

```mermaid
flowchart LR
  words["Words"]
  words --> w1["Components in place"]
  words --> w2["Use this code"]
  words --> w3["Figma has code"]
  words --> w4["Raise a bug"]
  w1 --> w1a["You see a page that looks built"]
  w1 --> w1b["They see a second library"]
  w2 --> w2a["You see a head start"]
  w2 --> w2b["They see a swap of the design system"]
  w3 --> w3a["You see Dev Mode"]
  w3 --> w3b["They see the snippet for their Button"]
  w4 --> w4a["The frame holds the thread"]
  w4 --> w4b["The ticket links the frame"]
```

The mismatch is vocabulary. A file that looks done reads, on their side, as a request to swap the design system. Dev Mode “having code” means the official snippet, the one Code Connect was added to show. Bug threads stay on the frame because that is the shared picture.

---

## 4. Split the jobs

```mermaid
flowchart LR
  jobs["Who does what"]
  jobs --> figma["Figma"]
  jobs --> cc["Code Connect"]
  jobs --> ds["Design system repo"]
  jobs --> claude["Claude"]
  jobs --> ticket["Ticket"]
  figma --> fA["Shared picture of the screen"]
  figma --> fB["Variants and states"]
  figma --> fC["Comments and bug threads"]
  figma --> fD["Library components on the frame"]
  cc --> cA["One snippet per library component"]
  cc --> cB["Import from the design system"]
  cc --> cC["Prop names the repo already has"]
  ds --> dA["The real components"]
  ds --> dB["Tokens"]
  ds --> dC["Where a new component is born"]
  claude --> lA["Composes those imports into a screen"]
  claude --> lB["Can draft a new system component inside the repo"]
  claude --> lC["Lists anything it invented as a proposal"]
  ticket --> tA["Links the frame"]
  ticket --> tB["Links the pull request"]
```

Figma holds the picture and the conversation. Code Connect holds the sentence “use this import.” The design system repo holds the actual components. Claude’s useful job is to **compose those imports**, or to draft a new system component **inside that repo**. A component invented only in chat stays a proposal until it exists in the library and in the design system, with a Code Connect snippet of its own.

---

## 5. How a screen gets through

```mermaid
flowchart LR
  path["Path"]
  path --> s1["1. Frame uses the library"]
  path --> s2["2. Claude gets the real imports"]
  path --> s3["3. Output is a composition"]
  path --> s4["4. Pull request in the app repo"]
  path --> s5["5. Bugs stay on the frame"]
  s1 --> s1a["Published components"]
  s1 --> s1b["Code Connect already attached"]
  s2 --> s2a["Design system package"]
  s2 --> s2b["Prop names and variants"]
  s2 --> s2c["The frame link"]
  s3 --> s3a["Imports the design system"]
  s3 --> s3b["Inventions listed as proposals"]
  s4 --> s4a["Uses those components"]
  s4 --> s4b["Links the frame"]
  s5 --> s5a["Comment or ticket"]
  s5 --> s5b["Same picture for design and dev"]
```

The frame is built from the published library, so Dev Mode already shows the right snippets. Claude is given that package, those prop names, and the frame link, and it writes a composition that imports them. Anything it had to invent is labeled a proposal, which waits for a library component and a design-system addition before a screen depends on it. The pull request lives in the app repo and links the frame. Later bugs go on that frame, so design and engineering stay on one picture.

---

## 6. What you send

```mermaid
flowchart LR
  hand["Handoff"]
  hand --> frame["Frame link"]
  hand --> state["State note"]
  hand --> file["Composition file"]
  hand --> prop["Proposal list"]
  frame --> fr1["Library components"]
  frame --> fr2["Comments on"]
  state --> st1["Loading"]
  state --> st2["Empty"]
  state --> st3["Error"]
  state --> st4["No permission"]
  file --> fi1["Imports only the design system"]
  file --> fi2["Matches published props"]
  prop --> pr1["Patterns the system does not have yet"]
  prop --> pr2["Each one waiting on library plus Code Connect"]
```

Send the frame, a short note for the states the frame does not draw, a composition that imports the design system, and a list of proposals. A proposal is a pattern the system does not have yet. It becomes usable after it is added to the Figma library, built in the design system repo, and given a Code Connect snippet.

---

## 7. Where the team works

```mermaid
flowchart LR
  now["Code library is the system"]
  now --> design["Design"]
  now --> eng["Engineering"]
  now --> owners["Library owners"]
  now --> old["Figma file"]
  design --> d1["Opens the library catalog"]
  design --> d2["Names components and their props"]
  design --> d3["Writes content and states"]
  design --> d4["A missing piece becomes a library proposal"]
  eng --> e1["Builds the screen from those imports"]
  eng --> e2["Reviews on a preview URL"]
  owners --> o1["Keep the package and its stories"]
  owners --> o2["Accept a new variant before screens use it"]
  old --> f1["Archived as history"]
  old --> f2["How the library was first drawn"]
```

The design system now lives in the component package the dev team already built. The catalog of that package — Storybook, if the package is published that way, or the component docs in the repo — is the picture everyone opens. Design reads it and names real components and real props. Engineering builds the screen from those imports and reviews a preview of that build. Library owners keep the package. A new variant is accepted there before a screen depends on it.

The Figma file stays as history of how those components were first drawn. New screens start in the catalog.

---

## 8. How a handoff moves

```mermaid
flowchart LR
  hand["Handoff"]
  hand --> ticket["Ticket"]
  hand --> preview["Preview"]
  hand --> gap["Library gap"]
  hand --> bug["Bug later"]
  ticket --> t1["Goal of the screen"]
  ticket --> t2["Component names from the catalog"]
  ticket --> t3["Props and variants"]
  ticket --> t4["Content"]
  ticket --> t5["Loading, empty, error, no permission"]
  preview --> p1["Composition that imports the package"]
  preview --> p2["URL of that build"]
  gap --> g1["Its own ticket"]
  gap --> g2["Lands in the package first"]
  bug --> b1["Link to the story or the screen"]
  bug --> b2["Screenshot of that build"]
  bug --> b3["Expected behavior against the props"]
```

A handoff is a ticket plus a preview. The ticket names the goal, the components as they are called in the catalog, the props and variants, the content, and the states. The preview is a composition that imports the package, at a URL people can open. Comments happen on that pull request.

Anything the library cannot do yet is a separate library ticket. The screen starts using it after that change is in the package.

A later bug points at the story or the screen, includes a screenshot of that build, and says what the props should have done.

---

## 9. What goes wrong

```mermaid
flowchart LR
  wrong["What goes wrong"]
  wrong --> w1["Figma stays in use"]
  wrong --> w2["A second component set"]
  wrong --> w3["Happy path only"]
  wrong --> w4["Controls rebuilt on the page"]
  wrong --> w5["Words instead of props"]
  wrong --> w6["A screenshot with no build"]
  wrong --> w7["Every page forced into the library"]
  w1 --> w1a["Someone updates the old file"]
  w1 --> w1b["Code and the file drift apart"]
  w2 --> w2a["Claude draws a new button and table"]
  w2 --> w2b["The package is skipped"]
  w3 --> w3a["Stories show the filled screen"]
  w3 --> w3b["Empty, error, and permission never get drawn"]
  w4 --> w4a["A feature copies a table locally"]
  w4 --> w4b["The next token change misses it"]
  w5 --> w5a["Ticket says primary save"]
  w5 --> w5b["The prop name in the package is different"]
  w6 --> w6a["Slack holds the only picture"]
  w6 --> w6b["Nobody knows which version was reviewed"]
  w7 --> w7a["The library becomes a dump of screens"]
  w7 --> w7b["Feature work waits on library review"]
```

The old file is the easiest thing to reopen. One edit there and the team has two design systems again.

With no frame to attach to, a Claude page that “has the components” is the same fork as before. It brings its own button and table and never imports the package.

Stories that only show the filled screen hide loading, empty, error, and permission. The handoff looks finished and the screen breaks on real data.

A feature that copies a table into the page has left the library. The next token or focus change does not reach it.

A ticket written in loose words (“primary save”) and a package that names that idea differently will be implemented twice, two different ways.

A screenshot in chat has no version. Review comments stick to a picture nobody can reopen.

Putting every full page into the library clogs it. Feature work then waits on a library review it did not need.

---

## 10. What to set right

```mermaid
flowchart LR
  right["What to set right"]
  right --> r1["One system of record"]
  right --> r2["Catalog covers the hard states"]
  right --> r3["Claude imports the package"]
  right --> r4["Two queues"]
  right --> r5["Review a URL"]
  right --> r6["Split ownership"]
  r1 --> r1a["Package is the design system"]
  r1 --> r1b["Figma file labeled as history"]
  r1 --> r1c["New tickets link a story or a preview"]
  r2 --> r2a["Variant stories"]
  r2 --> r2b["Loading, empty, error, disabled, no permission"]
  r3 --> r3a["Prompt includes the real component names and props"]
  r3 --> r3b["Inventions listed as library proposals"]
  r4 --> r4a["Screen queue composes what exists"]
  r4 --> r4b["Library queue adds a variant, then screens use it"]
  r5 --> r5a["Pull request preview or catalog build"]
  r5 --> r5b["Comments on that pull request"]
  r6 --> r6a["Library owns controls, patterns, and tokens"]
  r6 --> r6b["The screen owns layout and data"]
```

Name the package as the design system, and label the Figma file as history. New tickets link a story or a preview.

Give each component stories for its variants and for the hard states, so the catalog shows what the screen will actually do.

Give Claude the real names and props from the catalog. A composition may import the package. Anything it invents is a library proposal, and it waits.

Keep two queues. A screen is composed from components that already exist. A missing variant is a library change, merged first, then used by the screen.

Review happens on a preview URL, and the comments stay on that pull request.

The library owns the controls, the shared patterns, and the tokens. The screen owns layout and data. A new page does not become a new component, and a screen does not carry its own copy of a button.
