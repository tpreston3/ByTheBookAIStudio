import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CitationBadge } from '../index';

describe('CitationBadge', () => {
  it('renders citation label', () => {
    const citation = {
      docId: 'doc.pdf',
      page: 1,
      textSnippet: 'snippet',
      sectionLabel: 'Article 1'
    };
    render(<CitationBadge citation={citation} onClick={() => {}} />);
    expect(screen.getByText('Article 1')).toBeInTheDocument();
  });

  it('triggers onClick when clicked', () => {
    const citation = {
      docId: 'doc.pdf',
      page: 1,
      textSnippet: 'snippet',
      sectionLabel: 'Article 1'
    };
    const handleClick = vi.fn();
    render(<CitationBadge citation={citation} onClick={handleClick} />);
    
    const badge = screen.getByText('Article 1');
    fireEvent.click(badge);
    expect(handleClick).toHaveBeenCalledWith(citation);
  });
});
