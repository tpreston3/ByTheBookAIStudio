import { describe, it, expect } from 'vitest';
import { resolveCitation, type UploadedFile, type Citation } from '../index';

describe('Citation Resolution', () => {
  it('finds the correct document and term', () => {
    const documents: UploadedFile[] = [
        { name: 'Doc A.pdf', type: 'application/pdf', size: 100, content: 'Content A' },
        { name: 'Doc B.pdf', type: 'application/pdf', size: 100, content: 'Content B' }
    ];
    const citation: Citation = {
        docId: 'Doc A.pdf',
        page: 1,
        textSnippet: 'Content',
        sectionLabel: '1'
    };
    
    const result = resolveCitation(citation, documents);
    expect(result).toBeDefined();
    expect(result!.doc).toEqual(documents[0]);
    expect(result!.term).toBe('Content');
  });

  it('returns null if document not found', () => {
    const documents: UploadedFile[] = [];
    const citation: Citation = {
        docId: 'Missing.pdf',
        page: 1,
        textSnippet: 'Content',
        sectionLabel: '1'
    };
    
    const result = resolveCitation(citation, documents);
    expect(result).toBeNull();
  });
});
