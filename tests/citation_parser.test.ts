import { describe, it, expect } from 'vitest';
import { parseCitations } from '../index';

describe('parseCitations', () => {
  it('should parse a single citation', () => {
    const input = `According to the agreement...
<CITATION>
{
  "docId": "contract.pdf",
  "page": 10,
  "textSnippet": "The rule is X",
  "sectionLabel": "12.A"
}
</CITATION>
`;
    const result = parseCitations(input);
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].docId).toBe('contract.pdf');
    expect(result.citations[0].page).toBe(10);
    expect(result.content.trim()).toBe('According to the agreement...');
  });

  it('should parse multiple citations', () => {
    const input = `
First point.
<CITATION>{"docId": "a.pdf", "page": 1, "textSnippet": "A", "sectionLabel": "A"}</CITATION>
Second point.
<CITATION>{"docId": "b.pdf", "page": 2, "textSnippet": "B", "sectionLabel": "B"}</CITATION>
    `;
    const result = parseCitations(input);
    expect(result.citations).toHaveLength(2);
    expect(result.citations[0].docId).toBe('a.pdf');
    expect(result.citations[1].docId).toBe('b.pdf');
    expect(result.content).toContain('First point.');
    expect(result.content).toContain('Second point.');
    expect(result.content).not.toContain('<CITATION>');
  });

  it('should handle malformed JSON gracefully', () => {
    const input = `
<CITATION>
{ "docId": "bad.pdf", "page": 1, "textSnippet": "oops" 
</CITATION>
    `;
    const result = parseCitations(input);
    expect(result.citations).toHaveLength(0);
    expect(result.content.trim()).toBe(''); 
    // The regex replacement returns '' for the match, so the content effectively becomes empty string if that was all there was.
    // Wait, if JSON.parse fails, the catch block runs. 
    // The current implementation returns '' in the replace callback REGARDLESS of error.
    // So the citation tag is stripped, but nothing is added to citations array.
  });
});
