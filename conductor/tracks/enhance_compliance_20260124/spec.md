# Specification: Enhance Compliance Analysis with Detailed Citation Mapping and UI Refinement

## 1. Overview
This track focuses on elevating the "ByTheBook" platform from a general AI chatbot to a rigorous compliance tool. The primary objective is to ensure that every AI-generated claim, alert, or answer is explicitly linked to a specific section of the uploaded union contracts (SAG-AFTRA, DGA, IATSE). This builds trust by allowing users to verify the "source of truth." Additionally, we will refine the UI to elegantly display these citations without cluttering the high-end "Dark OS" aesthetic.

## 2. Goals
-   **Precision:** AI responses must cite specific articles/sections (e.g., "SAG-AFTRA Basic Agreement, Section 12.A").
-   **Traceability:** Users must be able to click a citation to view the source text in the document viewer.
-   **Visual Integration:** Citations must be integrated into the Chat and Dashboard UIs seamlessly, adhering to the existing design language.

## 3. User Stories
-   As a **Labor Compliance Officer**, I want to see exactly which paragraph of the contract triggered a meal penalty alert, so I can defend the decision to the production manager.
-   As a **Line Producer**, I want to click a citation in the Advisor Chat to immediately see the full context of the rule in the document viewer.
-   As a **User**, I want the interface to remain clean, with citations appearing as subtle, interactive elements rather than large blocks of text.

## 4. Technical Requirements
-   **Data Structure:** Update `Message` and `AuditLog` types to support structured `Citation` objects (Document Name, Page Number, Section ID, Snippet).
-   **AI Prompt Engineering:** Refine the system instruction in `handleSendMessage` and `handleValidateDealMemo` to enforce strict JSON output for citations or a standardized citation format that can be parsed.
-   **UI Components:**
    -   Create a `CitationTag` component for the Chat interface.
    -   Update `HighlightedDocument` to scroll to specific sections based on citation clicks.
    -   Enhance `AuditLog` display to show "View Source" links for violations.

## 5. Design Guidelines
-   **Citations:** Use the existing Amber (`text-amber-500`) color for interactive citation links.
-   **Hover States:** Citations should reveal a small tooltip preview of the text before clicking.
-   **Viewer:** The document viewer should highlight the cited section with a "focus" animation (e.g., a momentary flash of the Amber accent color).
