# Ecz Study Spark

I'm building a mobile first ECZ AI study app, use the images to recreate the app as the images demonstrate

CURRENT ALTERATIONS

ON THE HOMEPAGE

"MASTER EVERY TOPIC BEFORE EXAM DAY" BECOMES THE EXAM AND WHEN A USER HITS IT IT GOES TO THE AI TUTOR PAGE

REPLACE “TOPICS LEARNED, DUE TOPDAY AND AVG SCORE” WITH THE THREE SUBJECTS DUE THAT DAY, AND ABOVE IT PUT THE HEADER DUE TODAY

WHERE IT SAYS "JUMP BACK IN" ID LIKE U TO REMOVE IT

CHANGE “BROWSE SUBJECTS” TO JUST “SUBJECTS”

REMOVE "YOUR SUBJECTS" AND THE LIST OF SUBJECTS THAT FOLLOWS, WE DONT NEED THAT ON THE HOMEPAGE

REMOVE THE REVISE PAGE

Screen 1: User Authentication

Sign in or up….

Screen 2: Analytics

AI asks student what they got in the core subjects, which are MATH, PHYSICS, CHEMISTRY AND BIOLOGY from the last report card, it shows up as a table

Screen 3: The Onboarding

Prompt 1: "How many hours can you commit to studying each week?" e.g., “I can study on Mon, Tue and Friday from 2 to 4pm.” shows up below the input box with a low opacity

Screen 4: Weekly routine

Prompt 2: "Here is your optimized study routine”

AI uses time allocation to outline the number of subjects to cover per study day

AI uses report card to determine what subjects to put on specific days and how many times a week by prioritising weakest to strongest

Visualizing the time allocation as Notion Weekly Calendar-style-coloured blocks (e.g., Blue for Math, Green for Bio) makes the abstract concept of "time allocation" instantly real for the student.

User can edit the routine by tapping the subject or time block of that subject and a small module pops up of the other core subjects and they have to select, but u cant select two subjects twice so when choosing ur subject in the time block should be cleaned and by dragging the time block across the day

the analytics, and weekly routine can be adjusted when the user goes into settings, when a user Modifies either of the two thier update is saved in the database, the AI makes any neccesary recalculations, concerning the modification of the weekly routine AI updares the database when the user hits confirm, same goes for the report card thing, Id like u to come up with a good name for theses things, anyway the dataabase is only updated when the user says confirm

AI Tutor

Visual: Chatgpt or Claude chat window.

Header: "Good morning/afternoon/evening (name)." or “Let's get started name” similar to Claude

Sub header: what topic did you learn recently in (subjects of the day according to routine)

Starting the session immediately with "What did you learn recently in… and …?" takes the cognitive load off the user. The app already knows today is Math Day; it just needs the student to name the subtopic.

When user types “I learnt (subtopic)" or anything similar

When the student names a topic, The AI will match it to the closest official syllabus topic in the database before proceeding."

AI will ask what specific subtopic they are at by AI listing the subtopics as buttons and the student selects to be sure of where they currntly are at

Phase 1: The Present (Current Topic)

Focuses entirely on the current topic being learned in class.

The Tutor Loop:

The AI gives a summary → user has to write it down → AI asks user to proceed to the test at the end of the summary → when the user says yes → summary dissappears or closes so they can still have access to it, it acts as a conversational branch in an LLM → AI Tests the student with an ECZ-style question →Provides Socratic feedback if they get it wrong.

Phase 2: The Queue (Macro Review)

Once a topic is "graduated" from Phase 1, it lands here.

At the end of task 1

AI asks user, "Let's move on to topic X” (from the Queue).

Student answers yes, ok, yeah, etc.

Task 1 dissolves and disappears as if the user hit new chat on an LLM.

Having Phase 1 dissolve like hitting "New Chat" on Claude provides a visual "clean slate." It prevents the chat window from getting too long and overwhelming.

The Transition Logic:

If student types a new topic in the webhook

AI treats previous topic as completed

Invisible Backend Action: "e.g. Matrices" is instantly dumped “graduation” into the Review Queue

Task 2

At the end of task 2, AI asks "Let's move on to (subject)

Instead of making the user go back to a menu to click the second subject, the AI seamlessly transitions them: "Great job on Math. Let's move on to topic X in Biology." This traps them in a highly productive "flow state."

the window dissolves and disappears as if the user hit new chat on an LLM

The same workflow happens

At the end of phase 2 in subject 2 AI says You’re done for the day or anything simimar for a dopamine hit

Exam Mode

User sets a deadline by typing the exam date

AI gives the user the “high yield topics” among that they have covered so far

AI asks the user to set a confidence score from low, medium and high

AI uses all that infomation to create a ranking of the high yield topics from the highest priority which are the low confidence topics down to medium and high

AI refers to the users weekly routine to distribute those topics in a queue

AI creates an SRS based on the ebbinghaus curve till exam date

Location: A subtle, glowing toggle at the top right of the AI Tutor page

The Flow: When toggled ON...

AI: "Exam Mode activated. When is the actual exam?" window pops up (Student inputs date: Nov 4).

AI: "I've pulled the highest-yield Math topics. Rate your confidence on them."

UI: Sliders for Calculus, Earth Geometry, Trigonometry, etc. (Low, Med, High).

The Override: The AI immediately pauses the "Present" and "Queue" logic. The daily chat sessions now exclusively test the high-yield topics using an aggressive SRS Ebbinghaus curve until Exam Day.

Cold Start

This is how the app handles a student downloading it on Day 1 of the year, versus a student downloading it in the middle of Term 3.

Scenario A: The "Early" User (Starts Term 1, Week 1)

Onboarding: When the Mother Webhook asks, "What topic u on?", the student types the first topic of the year

The App Behavior: The Queue (Phase 2) is completely empty.

The Session: During their first few weeks, their 45-minute session is 100% Phase 1 (Present Topic). Phase 2 is completely hidden from the UI.

The Trigger: In Week 4, the Daily Webhook asks, "What topic u on??" and the student clicks New Topic.

The Activation: Topic X drops into the Queue. Phase 2 unlocks for the first time. From that day on, their sessions are split into Present and Queue.

Scenario B: The "Late" User (Starts Term 2 or Term 3)

Onboarding: When the Mother Webhook asks What topic u on? the student types a topic that the AI recognizes if after several topics (e.g., Sets, Algebra, Matrices, Probability, Statistics).

The App Behaviour: The Dumb Loop instantly populates with those previous topics.

The Session: On Day 1 of using the app, they get the full experience. They spend 25 minutes on Phase 1 (whatever they learned today) and 20 minutes on Phase 2 (the AI starts reviewing Sets, since it’s first in the line).

AI sends a notification to user as a reminder of incoming exams, user has to go into exam mode - non mvp

"For the UX animations, use smooth, premium Tailwind CSS transitions.

When hiding the summary, use a smooth height-collapse (accordion effect) over 300ms.

When clearing the chat window to transition from Phase 1 to Phase 2, use a staggered fade-out (opacity 0) and slide up, giving the user a 'clean slate' feel.

When a subject card on the dashboard is completed, flash a soft green success border for 800ms before scaling it down to 0 and removing it from the DOM."*

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a552d45b-7bde-4d7b-a048-f88facdb4b8d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
