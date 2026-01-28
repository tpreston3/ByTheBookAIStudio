import { describe, it, expectTypeOf } from 'vitest';
import type { Citation, Message, AuditLog } from '../index'; // Assuming types are exported from index.tsx

describe('Type Definitions', () => {
  it('should define a Citation interface with required properties', () => {
    expectTypeOf<Citation>().toMatchTypeOf<{
      docId: string;
      page: number;
      textSnippet: string;
      sectionLabel: string;
    }>();
  });

  it('should update Message interface to include citations', () => {
    expectTypeOf<Message>().toMatchTypeOf<{
      citations?: Citation[];
    }>();
  });

  it('should update AuditLog interface to include citations', () => {
    expectTypeOf<AuditLog>().toMatchTypeOf<{
      citations?: Citation[];
    }>();
  });
});
