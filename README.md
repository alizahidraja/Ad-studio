# 🎨 AZR Ad Studio — AI-Powered Product Ad Generator (Frontend-Only)

Create scroll-stopping product ads in seconds using conversational art direction.

👉 Live Demo: https://ad-studio-two.vercel.app/

![Live Demo](./UI.png)

---

## 🚀 Overview

Ad Studio is a lightweight, frontend-only AI-inspired creative tool that transforms a product image and a simple prompt into a polished ad concept.

Instead of relying on expensive APIs, the app simulates **agentic AI behavior** through smart prompt interpretation, design heuristics, and dynamic canvas composition — all running entirely in the browser.

---

## ✨ Features

- 🖼️ Upload product images (JPG/PNG)
- 💬 Natural language prompts ("summer Instagram ad", "luxury skincare vibe")
- 🤖 Smart prompt interpretation (simulated AI planning)
- 🎯 Auto-generated ad compositions
- 🎨 Interactive canvas editor (drag, resize, text, CTA)
- 🔁 Chat-based iteration ("make it warmer", "add headline")
- 🎭 Preset styles:
  - Clean ecommerce
  - Luxury editorial
  - Summer promo
  - Bold social ad
  - Minimal skincare
  - Modern tech
- 📦 Export final design as PNG
- ⚡ Fully client-side — zero API cost

---

## 🧠 Key Idea

> You don’t need expensive AI to create value — you need good product thinking.

This project focuses on:
- Translating vague user intent into structured design decisions
- Creating the *feeling* of intelligence through UX
- Delivering fast, interactive feedback loops

---

## 🏗️ Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Fabric.js** (canvas editor)
- **Zustand** (state management)
- **Framer Motion** (micro-interactions)

---

## 🧩 How It Works

1. User uploads a product image
2. User enters a prompt
3. The app converts the prompt into a structured "design plan":
   - Theme
   - Color palette
   - Layout
   - Typography
4. The canvas dynamically composes:
   - Background
   - Product placement
   - Headline
   - CTA
   - Shadows & effects
5. User iterates via chat → updates applied instantly

---

## 🎯 Why This Is Interesting

- No backend
- No API keys
- No paid AI usage
- Still feels like an intelligent system

This showcases:
- Product thinking
- UX design
- Creative engineering
- Agentic system simulation

---

## 🖥️ Local Setup

```bash
git clone https://github.com/alizahidraja/Ad-studio.git
cd ad-studio
npm install
npm run dev
```

## Prompt given to cursor to one-shot this website
```bash
You are building a polished FRONTEND-ONLY web app called “AZR Ad Studio” 

Goal:
Create a free-to-run, client-side product ad generator that feels like a smart ad studio, not a basic upload form. It must support:
1) product image upload
2) natural language prompt input
3) chat-style iterative edits
4) active image manipulation on a canvas/editor
5) clean, premium UI
6) zero backend requirement
7) zero paid APIs

Important constraints:
- Frontend only. Do not create a backend.
- Do not require any paid API keys.
- Use only free/open-source libraries and browser-side logic.
- The model quality does NOT need to be amazing, but the app must feel intelligent, interactive, and shippable.
- If true AI generation is not feasible client-side, create a strong “agentic” UX with smart prompt parsing, template selection, image composition, and canvas-based transformations.
- The app must run locally and be deployable as a static frontend on Vercel/Netlify.
- Prefer TypeScript.
- Make reasonable choices without asking me questions.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components if helpful
- Zustand for state
- Framer Motion for small interactions
- Fabric.js or Konva.js for the canvas/editor
- react-dropzone for upload
- lucide-react icons
- html-to-image or similar for export
- Optional: @xenova/transformers or another browser-safe free library only if it genuinely helps and does not break the app

Core product behavior:
This should feel like a mini “AI ad studio” with a conversation panel and a canvas workspace.

User flow:
1) User uploads a product image.
2) User types a prompt like:
   - “lifestyle photo on a marble countertop”
   - “summer Instagram ad with bold text”
   - “luxury skincare ad, warm lighting, minimal”
3) The app analyzes the prompt and image and creates an ad concept.
4) The result appears in a canvas/editor where the user can:
   - move the product
   - resize
   - add/edit headline
   - add CTA
   - change background style
   - toggle shadows, gradients, patterns, props, badge, and layout
5) A chat panel lets the user iterate:
   - “make it warmer”
   - “add a headline”
   - “use a darker background”
   - “make it feel premium”
   - “put the text at the top”
6) Each chat message should update the design state and rerender the canvas.

What to build:
A. App shell
- Left panel: upload + prompt/chat controls
- Center: live canvas/editor preview
- Right panel or bottom drawer: generated variations / style presets / editable properties
- Clean premium layout, responsive, with a strong visual hierarchy

B. Smart prompt engine
Build a local “AI planner” in frontend code that converts prompts into a structured design plan.
For example, from text like:
“summer Instagram ad with bold text”
generate:
- theme: summer
- color mood: warm, bright
- layout: social ad
- typography: bold
- composition: high contrast
- background: sunny gradient or clean lifestyle backdrop
- CTA style: visible and punchy

This does not need to be real AI, but it must feel intelligent.
Use keyword parsing, heuristics, and template mapping.
If you include an optional browser-side model, make it a progressive enhancement only.

C. Canvas/editor
Use a proper canvas-based editor feel, not just static image rendering.
Must support:
- background layer
- product image layer
- shadow/glow layer
- headline text layer
- CTA button layer
- badge/sticker layer
- decorative shapes or gradients
- drag and resize
- simple z-order control
- export to PNG

D. “Active image work”
Implement actual image transformations on the canvas:
- background tint / gradient generation
- product centering / scale adjustment
- shadow creation
- rounded card or poster frame
- subtle noise/grain overlay
- optional blurred backdrop
- color mood presets
- text placement presets
- automatic composition templates

If true image generation is not possible client-side, emulate “AI image generation” by dynamically composing a premium ad visual from the uploaded product and prompt-driven art direction. The app should still feel like it is actively creating a new creative asset.

E. Chat iteration
Build a simple chat UI with:
- user message bubble
- assistant response bubble
- “Apply” action if the assistant proposes a change
- a design-state update after each instruction

Example behavior:
User: “make the background warmer”
Assistant: “Updated the palette to a warmer sunset tone and increased contrast around the product.”
Then the canvas updates instantly.

F. Variations
Add 3–6 preset creative styles:
- Clean ecommerce
- Luxury editorial
- Summer promo
- Bold social ad
- Minimal skincare
- Modern tech

Clicking a preset should update the composition immediately.

G. Nice-to-have polish
- loading state
- subtle animations
- sample prompts
- undo/redo if easy
- save current state in localStorage
- before/after toggle
- download button
- empty state that looks great

Implementation requirements:
- Make it production-quality front-end code.
- Organize code cleanly into components, hooks, utils, and types.
- Use a central design state store.
- Keep the architecture simple and readable.
- Add comments only where useful.
- Avoid overengineering.
- No backend calls.
- No environment variables required for core functionality.

Suggested file structure:
- app/
- components/
- hooks/
- lib/
- store/
- types/
- constants/
- styles/

Recommended design state model:
- uploadedImage
- productPlacement
- backgroundStyle
- theme
- headline
- CTA
- badge
- chatHistory
- activePreset
- canvasElements
- exportStatus
- promptHistory

What the final result should feel like:
A polished, interactive product ad creator that looks like:
- a cross between Canva and a lightweight AI creative tool
- something a recruiter can click and immediately understand
- something that shows product instinct, not just raw coding

Acceptance criteria:
- App runs locally with one install and one start command.
- Uploading an image works.
- Prompting works.
- Chat-based edits work.
- Canvas updates visually with every change.
- Export/download works.
- No backend required.
- UI looks intentional and finished.
- The code is clean enough to present in a repo.

Do this in a way that maximizes the “wow” factor for a viral linkedin post
Prioritize user experience, polish, and clarity over fancy ML.
If a feature is too heavy, replace it with a smarter UI/UX version that still feels agentic.

Now implement the full app.
Start by scaffolding the project, then build the state store, then the canvas/editor, then the chat iteration flow, then polish and export.
```