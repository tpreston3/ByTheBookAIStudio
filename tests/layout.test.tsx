import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatBubble, type Message } from '../index';

describe('ChatBubble', () => {
  it('renders content and citations footer', () => {
    const message: Message = {
        role: 'assistant',
        content: 'Hello world',
        citations: [
            { docId: 'doc1.pdf', page: 1, textSnippet: 'text', sectionLabel: 'Label 1' }
        ]
    };
    
    render(<ChatBubble message={message} onCitationClick={() => {}} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Verified Sources')).toBeInTheDocument();
    expect(screen.getByText('Label 1')).toBeInTheDocument();
  });

  it('does not render footer if no citations', () => {
    const message: Message = {
        role: 'assistant',
        content: 'Hello world'
    };
    
    render(<ChatBubble message={message} onCitationClick={() => {}} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.queryByText('Verified Sources')).not.toBeInTheDocument();
  });
});
