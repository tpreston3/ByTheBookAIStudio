import { describe, it, expect } from 'vitest';
import { constructAuditPrompt, type ValidationResult } from '../index';

describe('Audit Prompt Engineering', () => {
  it('should include source_reference in the JSON schema', () => {
    const context = {
      name: 'Test Project',
      location: 'LA',
      budgetAmount: '1000',
      startDate: '2023-01-01',
      endDate: '2023-01-02',
      unions: ['SAG']
    };

    const prompt = constructAuditPrompt(context);
    
    expect(prompt).toContain('"source_reference":');
    expect(prompt).toContain('"docId": "string"');
    expect(prompt).toContain('"page": "number"');
    expect(prompt).toContain('"textSnippet": "verbatim text from the UNION CONTRACT (not the deal memo)"');
    expect(prompt).toContain('"sectionLabel": "string"');
  });

  it('should match ValidationResult interface', () => {
    const result: ValidationResult = {
        status: 'warning',
        summary: 'Test summary',
        issues: [{
            rule: 'Rule 1',
            description: 'Desc',
            severity: 'high',
            source_reference: {
                docId: 'doc.pdf',
                page: 1,
                textSnippet: 'text',
                sectionLabel: '1.1'
            }
        }]
    };
    expect(result.issues[0].source_reference).toBeDefined();
  });
});
