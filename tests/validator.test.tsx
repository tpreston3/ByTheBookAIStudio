import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ValidatorResults, type ValidationResult } from '../index';

describe('ValidatorResults', () => {
  it('renders citation for issues', () => {
    const result: ValidationResult = {
        status: 'violation',
        summary: 'Failed',
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
    
    render(<ValidatorResults result={result} onVerify={() => {}} />);
    
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('triggers verification on click', () => {
    const result: ValidationResult = {
        status: 'violation',
        summary: 'Failed',
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
    
    const handleVerify = vi.fn();
    render(<ValidatorResults result={result} onVerify={handleVerify} />);
    
    const citation = screen.getByText('1.1');
    // Assuming clicking the citation or a button next to it triggers verify.
    // I'll test that clicking the citation badge works, as I'll reuse CitationBadge.
    fireEvent.click(citation);
    
    expect(handleVerify).toHaveBeenCalledWith(result.issues[0].source_reference);
  });
});
