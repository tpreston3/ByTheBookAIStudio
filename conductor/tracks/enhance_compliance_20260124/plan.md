# Implementation Plan - Enhance Compliance Analysis

## Phase 1: Foundation - Citation Engine [checkpoint: 914004c]
- [x] **Task: Define Citation Data Structures** <!-- e2dc9b1 -->
    - [x] Define `Citation` interface in `index.tsx` (docId, page, textSnippet, sectionLabel).
    - [x] Update `Message` and `AuditLog` interfaces to include `citations: Citation[]`.
- [x] **Task: Update AI Prompt Engineering for Chat** <!-- 4e5f913 -->
    - [x] Modify `handleSendMessage` system instruction to request specific citation formats (e.g., XML tags or JSON blocks) embedded in the response.
    - [x] Implement a parser to extract these citations from the raw AI text stream and populate the `citations` array.
- [x] **Task: Update AI Prompt Engineering for Audit** <!-- 4e5f913 -->
    - [x] Modify `handleValidateDealMemo` prompt to require `source_reference` fields for every identified issue.
    - [x] Verify that the returned JSON structure correctly maps to the new interface.
- [x] **Task: Conductor - User Manual Verification 'Foundation - Citation Engine' (Protocol in workflow.md)** <!-- 914004c -->**

## Phase 2: UI Integration - Advisor Chat [checkpoint: 640c192]
- [x] **Task: Create Citation Component** <!-- 0b5e6d0 -->
    - [x] Build `CitationBadge` component using Tailwind (Amber border/text, small, pill-shaped).
    - [x] Implement "Tooltip" behavior on hover to show the specific section/article name.
- [x] **Task: Connect Chat to Document Viewer** <!-- 878f80a -->
    - [x] Write logic to handle clicks on `CitationBadge`.
    - [x] Ensure clicking opens the Document Viewer (`viewingDoc` state) and auto-scrolls/highlights the specific snippet.
- [x] **Task: Refine Chat Layout** <!-- 878f80a -->
    - [x] Adjust `renderMessageContent` to render `CitationBadge` inline with text or as a footnote section at the bottom of the message bubble.
- [x] **Task: Conductor - User Manual Verification 'UI Integration - Advisor Chat' (Protocol in workflow.md)** <!-- 640c192 -->

## Phase 3: UI Integration - Compliance Dashboard & Validator [checkpoint: 16184c7]
- [x] **Task: Update Validator Output** <!-- 640c192 -->
    - [x] Modify the "Audit Engine" results view to display citations next to each "Rule" violation.
    - [x] Add a "Verify" button to each issue that opens the source document.
- [x] **Task: Enhance Audit Logs** <!-- 640c192 -->
    - [x] Update the `logs` table to include a column or expandable detail view showing the primary citation for the decision.
- [x] **Task: Conductor - User Manual Verification 'UI Integration - Compliance Dashboard & Validator' (Protocol in workflow.md)** <!-- 16184c7 -->

## Phase 4: Refinement & Verification
- [x] **Task: Visual Polish** <!-- 640c192 -->
    - [x] Ensure all new elements match the "Dark OS" aesthetic (proper border radius, backdrop blur, correct color palette).
    - [x] Test contrast ratios for citation text.
- [x] **Task: End-to-End Testing** <!-- 16184c7 -->
    - [x] Upload a sample dummy contract.
    - [x] Ask a specific question ("What is the meal penalty?").
    - [x] Verify the answer cites the specific section.
    - [x] Click the citation and verify the document viewer opens to the correct location.
- [ ] **Task: Conductor - User Manual Verification 'Refinement & Verification' (Protocol in workflow.md)**
