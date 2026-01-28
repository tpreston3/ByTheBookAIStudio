import { describe, it, expect } from 'vitest';
import { parseCitations } from '../index'; // This will fail initially

describe('Chat Citation Parsing', () => {
  it('should extract JSON citations from text', () => {
    const rawText = `
      The meal penalty is triggered after 6 hours.
      <CITATION>
      {
        "docId": "SAG_Basic.pdf",
        "page": 12,
        "textSnippet": "Meal periods shall be not less than...",
        "sectionLabel": "Section 12"
      }
      </CITATION>
    `;

    const result = parseCitations(rawText);
    
    expect(result.content.trim()).toBe('The meal penalty is triggered after 6 hours.');
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].docId).toBe('SAG_Basic.pdf');
    expect(result.citations[0].sectionLabel).toBe('Section 12');
  });

  it('should handle multiple citations', () => {
    const rawText = `
      Point 1
      <CITATION>{"docId": "A.pdf", "page": 1, "textSnippet": "A", "sectionLabel": "1"}</CITATION>
      Point 2
      <CITATION>{"docId": "B.pdf", "page": 2, "textSnippet": "B", "sectionLabel": "2"}</CITATION>
    `;

    const result = parseCitations(rawText);
    expect(result.citations).toHaveLength(2);
    expect(result.content).toContain('Point 1');
    expect(result.content).toContain('Point 2');
    expect(result.content).not.toContain('<CITATION>');
  });

  it('should handle text without citations', () => {
    const rawText = 'Just normal text.';
    const result = parseCitations(rawText);
    expect(result.citations).toHaveLength(0);
    expect(result.content).toBe('Just normal text.');
  });
});
