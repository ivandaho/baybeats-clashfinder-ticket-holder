# Baybeats 2025 Clashfinder + Ticket Holder

Clashfinder + ticket holder web app for Baybeats 2025, a music festival held yearly in Singapore. works offline as a PWA and keeps all data stored locally in the user's browser

[https://baybeats-clashfinder-ticket-holder.vercel.app/](https://baybeats-clashfinder-ticket-holder.vercel.app/)

- `npm run dev` to run locally

## Features

- **Clashfinder**:
  - Proportionately sized clashfinder that displays venues, set times, and number of tickets stored per set
  - data driven instead of hardcoded, based on a specified JSON schema, so changes to the schedule (fingers crossed) can be easily made
  - If loaded during festival dates, defaults to the current day on page load
  - A "current time" indicator, updates on scroll
- **Ticket Storage**:
  - Bulk upload and store ticket PDFs in IndexedDB
  - De-duplicates and combines PDFs for each set for easy access
  - this way, you only need to open one PDF file, just scroll down to each ticket's barcode for the staff to scan, instead of opening multiple PDFs from each purchase
  - Allows for the removal of tickets on a per-set basis
- **Runs Locally**:
  - Everything is processed and stored locally; no data is uploaded
  - Works as a PWA, even without an active internet connection

## Tech Stack

Built with the following:

- React with Vite and TypeScript
- Tailwind CSS
- **Local Storage**:
  - IndexedDB for storing PDF files, managed with `idb` library
  - `localStorage` for storing ticket metadata
- **PDF Handling**:
  - `pdf-lib` for combining PDF files
  - `pdf.js` for parsing and extracting text from PDF files
- **Other**:
  - ESLint
  - Vite PWA Plugin
  - Hosted with Vercel via this GitHub repo

## Project

### Users

- possibly a few hundred total users, based on limited stats from Vercel

### Timeline

| Festival Day | event                                                                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -1 day       | Implemented first version that supported multiple PDFs at once, however no de-duplication yet                                                                                                                                                                    |
| 1            | Add some QOL features and small tweaks. Realised that I need to implement bulk upload and de-duplication of PDFs, as that is likely the most useful feature                                                                                                      |
| 2            | It occured to me to check light mode implementation. Of course, it was bugged from the start                                                                                                                                                                     |
| 3            | Tried to rush a fix to make the Current Time indicator update automatically over time. Added handle to `onScrollEnd`, but turns out this isn't implemented in Safari and Safari iOS, which I only discovered later on my device. Reverted to a previous version. |
| 4            | Added a way to check for version (first time attempting PWA, and not sure how updates would work). move the handle to `onScroll` for compatibility.                                                                                                              |

## Retrospective

### What could be improved:

- **Code Quality and Refactoring**:
  - `Clashfinder.tsx` component could be refactored and broken down into smaller components
  - `pdf.ts` could be split into smaller modules based on functionality (e.g., `pdf-parsing.ts`, `db.ts`, `local-storage.ts`), nearing the end of this short dev cycle, it became a dump for _any_ util function
  - figure out "magic numbers" and/or specify them as constants
- **State Management**:
  - currently a bit all over the place, could be better managed, perhaps with a state management library like Zustand
- **Debounce Implementation**:
  - The current `debounce` function triggers _after_ the specified delay, but a "leading" debounce that triggers the function on the first call would allow for a more responsive UX
- **UI/UX**:
  - **Scrolling**: Improve overflow and sticky behavior
  - **Long Band Names**: Handle long band names more gracefully, maybe truncate them with an ellipsis and show the full name on hover or long press
  - **Error Handling**: More robust error handling e.g. if a PDF fails to parse, or if the PDF is missing in IndexedDB during retrieval
  - **Bundle Size**: pdf-lib has quite a large bundle size, given that the only functionality used in that library for this app is to combine PDF files, it might be possible to reduce the final bundle size

### Other possible features:

- **Highlight/Mute Bands**: A feature to allow users to "highlight" bands they want to watch and "mute" bands they want to skip
- **Schedule Sharing**: Allow users to share their highlighted schedules with friends via URL with query params or QR code
- **Notifications**: Push notifications for upcoming sets
- **Artist Info**: link to artist/set information

## Disclaimer

- there were some use of AI coding tools in this project, namely the initial ClashFinder code, a function to format dates (I didn't want to add a date library for formatting just yet), and some parts of the migration function when adding the de-duplication feature
