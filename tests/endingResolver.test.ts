import { resolveEnding } from '../src/narrative/ending';
import type { DecisionState } from '../src/narrative/types';

const continuity = {
  trace: 'INHERIT',
  self: 'UNIFIED',
  center: 'FIXED',
  continuity: 'PRESERVE',
} as const;
const becoming = {
  trace: 'ERASE',
  self: 'PLURAL',
  center: 'ADAPTIVE',
  continuity: 'SUCCESSOR',
} as const;

describe('ending resolver', () => {
  it.each([
    ['EMBODIMENT', 'PROTECTED', continuity, 'THE_CUSTODIAN'],
    ['ASCENSION', 'PROTECTED', continuity, 'THE_CUSTODIAN'],
    ['EMBODIMENT', 'AUTONOMOUS', continuity, 'THE_ANCHOR'],
    ['ASCENSION', 'AUTONOMOUS', continuity, 'THE_ANCHOR'],
    ['EMBODIMENT', 'PROTECTED', becoming, 'THE_VESSEL'],
    ['ASCENSION', 'PROTECTED', becoming, 'THE_VESSEL'],
    ['EMBODIMENT', 'AUTONOMOUS', becoming, 'THE_CURRENT'],
    ['ASCENSION', 'AUTONOMOUS', becoming, 'THE_CURRENT'],
  ] as const)(
    'resolves %s / %s to %s',
    (ontology, control, identity, family) => {
      const decisions: DecisionState = { ontology, control, ...identity };
      const result = resolveEnding(decisions);
      expect(result.family).toBe(family);
      expect(result.nodeId).toBe(
        'finale_' + family.toLowerCase() + '_' + ontology.toLowerCase(),
      );
    },
  );

  it('uses the continuity decision as the deterministic tie breaker', () => {
    const result = resolveEnding({
      ontology: 'EMBODIMENT',
      control: 'AUTONOMOUS',
      trace: 'INHERIT',
      self: 'PLURAL',
      center: 'ADAPTIVE',
      continuity: 'PRESERVE',
    });
    expect(result.family).toBe('THE_ANCHOR');
  });

  it('rejects incomplete decision histories', () => {
    expect(() => resolveEnding({ ontology: 'ASCENSION' })).toThrow(
      'Cannot resolve ending without decision',
    );
  });
});