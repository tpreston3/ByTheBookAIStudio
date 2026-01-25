# Implementation Plan - Enhance Compliance Analysis

## Phase 1: Foundation - Citation Engine [checkpoint: 294b60f]
- [x] **Task: Define Citation Data Structures** 6cc4c79
    - [x] Define `Citation` interface in `index.tsx` (docId, page, textSnippet, sectionLabel).
    - [x] Update `Message` and `AuditLog` interfaces to include `citations: Citation[]`.
- [x] **Task: Update AI Prompt Engineering for Chat** 4932f4c
    - [x] Modify `handleSendMessage` system instruction to request specific citation formats (e.g., XML tags or JSON blocks) embedded in the response.
    - [x] Implement a parser to extract these citations from the raw AI text stream and populate the `citations` array.
- [x] **Task: Update AI Prompt Engineering for Audit** 811e846
    - [x] Modify `handleValidateDealMemo` prompt to require `source_reference` fields for every identified issue.
    - [x] Verify that the returned JSON structure correctly maps to the new interface.
- [x] **Task: Conductor - User Manual Verification 'Foundation - Citation Engine' (Protocol in workflow.md)**

## Phase 2: UI Integration - Advisor Chat [checkpoint: 9ec0e32]
- [x] **Task: Create Citation Component** 4b45188
    - [x] Build `CitationBadge` component using Tailwind (Amber border/text, small, pill-shaped).
    - [x] Implement "Tooltip" behavior on hover to show the specific section/article name.
- [x] **Task: Connect Chat to Document Viewer** 980c19f
    - [x] Write logic to handle clicks on `CitationBadge`.
    - [x] Ensure clicking opens the Document Viewer (`viewingDoc` state) and auto-scrolls/highlights the specific snippet.
- [x] **Task: Refine Chat Layout** 3d711f9
    - [x] Adjust `renderMessageContent` to render `CitationBadge` inline with text or as a footnote section at the bottom of the message bubble.
- [x] **Task: Conductor - User Manual Verification 'UI Integration - Advisor Chat' (Protocol in workflow.md)**

## Phase 3: UI Integration - Compliance Dashboard & Validator [checkpoint: 33ff81a]
- [x] **Task: Update Validator Output** a28931d
    - [x] Modify the "Audit Engine" results view to display citations next to each "Rule" violation.
    - [x] Add a "Verify" button to each issue that opens the source document.
- [x] **Task: Enhance Audit Logs** 7fcca81
    - [x] Update the `logs` table to include a column or expandable detail view showing the primary citation for the decision.
- [x] **Task: Conductor - User Manual Verification 'UI Integration - Compliance Dashboard & Validator' (Protocol in workflow.md)**

## Phase 4: Refinement & Verification
- [x] **Task: Visual Polish** 2c63644
    - [x] Ensure all new elements match the "Dark OS" aesthetic (proper border radius, backdrop blur, correct color palette).
    - [x] Test contrast ratios for citation text.
- [~] **Task: End-to-End Testing**
    - [ ] Upload a sample dummy contract.
    - [ ] Ask a specific question ("What is the meal penalty?").
    - [ ] Verify the answer cites the specific section.
    - [ ] Click the citation and verify the document viewer opens to the correct location.
- [ ] **Task: Conductor - User Manual Verification 'Refinement & Verification' (Protocol in workflow.md)**
