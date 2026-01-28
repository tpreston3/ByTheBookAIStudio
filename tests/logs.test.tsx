import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuditLogsTable, type AuditLog } from '../index';

describe('AuditLogsTable', () => {
  it('renders citation information', () => {
    const logs: AuditLog[] = [{
        id: '1',
        timestamp: '10:00',
        query: 'Test Query',
        status: 'compliant',
        citations: [{
            docId: 'doc.pdf',
            page: 1,
            textSnippet: 'text',
            sectionLabel: '1.1'
        }]
    }];
    
    render(<AuditLogsTable logs={logs} onVerify={() => {}} />);
    
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });
});
