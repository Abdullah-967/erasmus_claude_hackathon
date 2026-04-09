# Personal Wikipedia Companion — spec.md

## 1. Overview

**Personal Wikipedia Companion** is a conversational AI that turns everything a user learns into a living, linked personal wiki.  
Users can talk to it, paste notes, or upload files, and the system creates, updates, links, and reasons over their personal knowledge base.

### One-line pitch

Talk to your learning, and your personal wiki builds itself.

## 2. Problem

People learn across chats, notes, papers, screenshots, and random thoughts, but their knowledge stays fragmented.

Current tools mostly help users **store notes**.  
They do not actively:

- structure knowledge
- connect ideas
- maintain evolving understanding
- surface gaps or contradictions

Result:

- insights get lost
- connections are missed
- learning remains shallow
- revisiting prior understanding is hard

## 3. Vision

Build a **living personal Wikipedia** that:

- captures what the user learns
- structures it into pages
- links related ideas
- updates pages as understanding evolves
- answers questions grounded in the user’s own knowledge
- surfaces patterns, gaps, and contradictions

This is not just note-taking.  
It is **knowledge maintenance and sensemaking**.

## 4. Core Promise

The user should be able to:

- say what they learned
- upload notes or a paper
- ask how it connects to prior knowledge
- get a clean wiki page and linked knowledge structure back

The AI should do the heavy lifting:

- page creation
- summarization
- linking
- updating
- merging
- pattern finding
- answering from the user’s own wiki

## 5. Target Users

Primary users:

- students
- researchers
- self-learners
- builders
- knowledge workers

Especially people who:

- learn a lot
- think in concepts
- consume many sources
- struggle with fragmented understanding
- want a second brain without manual maintenance

## 6. Product Thesis

Notes apps = passive storage.  
Personal Wikipedia Companion = active structuring, linking, and reasoning.

The product helps users build an evolving knowledge world, not just collect notes.

## 7. Core User Stories

### Capture

- As a user, I want to tell the system what I just learned so it turns it into a structured wiki page.
- As a user, I want to upload a paper or notes so the system adds them to my wiki.

### Organize

- As a user, I want the system to detect related topics and create links automatically.
- As a user, I want overlapping concepts to be merged or reconciled.

### Reflect

- As a user, I want to ask how a new idea connects to what I already know.
- As a user, I want the system to surface contradictions, gaps, and recurring themes.

### Retrieve

- As a user, I want to ask questions grounded in my own wiki rather than getting generic answers.
- As a user, I want to browse my knowledge through linked pages.

## 8. Core Experience

### Inputs

The user can provide:

- chat text
- rough reflections
- pasted notes
- uploaded file or paper
- follow-up questions

### Outputs

The system generates or updates:

- a wiki page
- related topic links
- summary and key points
- connected concepts
- source references
- open questions
- knowledge gaps or contradictions where relevant

## 9. Product Loop

1. **User inputs knowledge**  
   Example: “Today I learned what RDDs really are.”

2. **System interprets intent**  
   It decides whether this is:
   - new knowledge
   - an update to existing knowledge
   - a question over existing knowledge
   - a request to connect concepts

3. **System acts on the wiki**  
   It may:
   - create a page
   - update a page
   - merge pages
   - create links
   - attach source material
   - surface patterns or gaps

4. **User sees visible evolution**  
   The UI shows:
   - what page changed
   - what was added
   - what links were created
   - what related topics were found
   - what open questions remain

This visible evolution is the magic moment.

## 10. Product Principles

1. **Conversational first**  
   The system should feel like a companion, not a database UI.

2. **Structured behind the scenes**  
   Natural interaction, structured knowledge.

3. **Visible intelligence**  
   The user should see what changed, added, or connected.

4. **Personal grounding**  
   Responses should come from the user’s own wiki first.

5. **Evolving understanding**  
   Knowledge should be refined over time, not stored once.

## 11. Scope

### Must-have

- conversational ingestion
- file-based ingestion
- wiki page creation/update
- concept linking
- personal wiki Q&A
- action transparency in UI

### Strong stretch features

- knowledge gaps
- contradiction detection
- learning graph
- suggested next learning topics

### Non-goals

This product is **not**:

- a general-purpose chatbot
- a productivity suite
- a note-taking clone
- a multi-user collaboration tool
- a generic graph database pitch

It is specifically:
**a self-building personal wiki companion**

## 12. Internal System Architecture

### High-level model

One main conversational runtime with specialized internal skills.

### Main runtime responsibilities

- receive user input
- detect knowledge action needed
- invoke the right skill/tool
- update wiki state
- return user-facing response

### Internal skills

- `ingest_knowledge`
- `summarize_source`
- `create_wiki_page`
- `update_wiki_page`
- `link_related_pages`
- `merge_duplicate_concepts`
- `query_personal_wiki`
- `find_knowledge_gaps`
- `surface_patterns`

Optional internal worker framing:

- **Archivist** → stores and updates knowledge
- **Synthesizer** → structures raw input
- **Linker** → connects concepts
- **Cartographer** → builds the map
- **Socratic Companion** → asks, explains, challenges

## 13. Data Model

### Wiki Page

Each page should contain:

- `id`
- `title`
- `type`
- `aliases`
- `summary`
- `body`
- `key_points`
- `examples`
- `related_topics`
- `backlinks`
- `sources`
- `open_questions`
- `confidence_or_completeness`
- `created_at`
- `updated_at`
- `change_log`

### Link Object

- `source_page_id`
- `target_page_id`
- `relationship_type`
- `relationship_reason`

Possible relationship types:

- related_to
- prerequisite_for
- extends
- contradicts
- example_of
- similar_to

### Source Object

- `source_type`
- `source_name`
- `uploaded_at`
- `excerpt`
- `file_reference`

## 14. Main Flows

### Flow 1 — Add new knowledge

User: “Today I learned what Catalyst optimizer does.”

System:

- detects concept
- checks whether page exists
- creates or updates page
- identifies related pages
- links to Spark, DataFrames, query planning, optimization

### Flow 2 — Upload a paper

User uploads a paper and says:
“Add this to my wiki and connect it to what I know about attention.”

System:

- extracts title, topic, and core claims
- creates paper page and/or concept page
- links to relevant existing pages
- shows summary, key insights, related topics

### Flow 3 — Ask across wiki

User:
“How does this connect to my earlier understanding of RDDs?”

System:

- retrieves relevant pages
- synthesizes the connection
- points to linked topics
- suggests missing bridge concepts where relevant

### Flow 4 — Reflective companion

User:
“What am I still missing?”

System:

- checks topic coverage
- surfaces weakly connected or unresolved areas
- suggests next topics or questions

## 15. UX / Interface

### Main layout

- **Left panel:** chat
- **Center panel:** active wiki page
- **Right panel:** related pages, updates, graph, or open questions

### Important UI behavior

After each action, show a compact **knowledge update card**:

- page created or updated
- links added
- related concepts found
- unresolved questions

This is essential to make the system feel alive.

## 16. Technical Direction

### Recommended build approach

- simple frontend chat interface
- page renderer
- backend orchestrator
- structured storage for pages and links
- Claude-powered extraction and generation
- optional graph view

### Storage options

Fast options:

- local JSON
- markdown pages
- SQLite
- Supabase if the team is already comfortable

### Core technical behaviors

- narrow, product-specific intent detection
- page generation from raw input
- automatic link generation
- retrieval grounded in personal wiki first

## 17. Demo Strategy

### Demo goal

Show that the system:

- absorbs messy learning input
- structures it into a page
- links it into a broader knowledge web
- reasons over the user’s own knowledge

### Demo sequence

1. Show fragmented learning
2. Paste a rough note or upload a paper
3. Show wiki page creation/update
4. Show related links appear
5. Ask:
   - “How does this connect to what I knew before?”
   - “What am I still missing?”

That sequence demonstrates the core magic clearly.

## 18. Success Criteria

The prototype succeeds if a user can:

- tell it something they learned
- see a clean wiki page appear
- see related concepts linked automatically
- ask a question over their own knowledge
- feel that the system organizes and deepens their understanding

## 19. Pitch-ready Closing

**Personal Wikipedia Companion** turns fragmented learning into a living, linked knowledge world.  
Instead of manually maintaining notes, users simply talk, paste, or upload what they learn, and the system builds, updates, and reasons over their personal wiki for them.
