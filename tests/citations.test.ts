import { describe, it, expect } from 'vitest';
import type { Message, AuditLog, Citation } from '../index';

describe('Citation Data Structures', () => {
  it('should support Citation interface', () => {
    const citation: Citation = {
      docId: 'test-doc.pdf',
      page: 5,
      textSnippet: 'This is a test snippet',
      sectionLabel: 'Section 12.A'
    };
    expect(citation).toBeDefined();
    expect(citation.docId).toBe('test-doc.pdf');
  });

  it('should have citations in Message interface', () => {
    const message: Message = {
      role: 'assistant',
      content: 'Test content',
      citations: [
        {
          docId: 'test.pdf',
          page: 1,
          textSnippet: 'quote',
          sectionLabel: '1.1'
        }
      ]
    };
    expect(message.citations).toHaveLength(1);
    expect(message.citations![0].sectionLabel).toBe('1.1');
  });

  it('should have citations in AuditLog interface', () => {
    const log: AuditLog = {
      id: '123',
      timestamp: '2023-01-01',
      query: 'test',
      status: 'compliant',
      citations: [
        {
          docId: 'audit.pdf',
          page: 10,
          textSnippet: 'audit quote',
          sectionLabel: '2.B'
        }
      ]
    };
    expect(log.citations).toHaveLength(1);
  });
});
