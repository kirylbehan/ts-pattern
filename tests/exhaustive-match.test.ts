import { match, when, __ } from '../src';
import { Option, NotNever, Blog } from './utils';

describe('exhaustive()', () => {
  it('should forbid using guard function, in pattern or as extra args', () => {
    match<Option<number>>({ kind: 'some', value: 3 })
      .exhaustive()
      .with(
        {
          kind: 'some',
          // @ts-expect-error
          value: when((x) => x > 2),
        },
        () => true
      )
      .run();

    match<Option<number>>({ kind: 'some', value: 3 })
      .exhaustive()
      .with(
        { kind: 'some' },
        ({ value }) => value > 2,
        // @ts-expect-error
        () => true
      )
      // @ts-expect-error
      .run();
  });

  describe('should exclude matched patterns from subsequent `.with()` clauses', () => {
    it('string literals', () => {
      type Input = 'a' | 'b' | 'c';
      const input = 'b' as Input;

      match(input)
        .exhaustive()
        .with('b', (x) => {
          const check: 'b' = x;
          return 1;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with('a', (x) => 1)
        .with('b', (x) => 1)
        // twice the same match
        // @ts-expect-error
        .with('b', (x) => 1)
        .run();

      match(input)
        .exhaustive()
        .with('a', (x) => {
          const check: 'a' = x;
          return 1;
        })
        .with('b', (x) => {
          const check: 'b' = x;
          return 2;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with('a', (x) => {
          const check: 'a' = x;
          return 1;
        })
        .with('b', (x) => {
          const check: 'b' = x;
          return 2;
        })
        .with('c', (x) => {
          const check: 'c' = x;
          return 2;
        })
        .run();
    });

    it('number literals', () => {
      type Input = 1 | 2 | 3;
      const input = 2 as Input;

      match(input)
        .exhaustive()
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(1, (x) => 1)
        .with(2, () => 3)
        // twice the same match
        // @ts-expect-error
        .with(2, () => 3)
        .run();

      match(input)
        .exhaustive()
        .with(1, (x) => {
          const check: 1 = x;
          return 1;
        })
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(1, (x) => {
          const check: 1 = x;
          return 1;
        })
        .with(2, (x) => {
          const check: 2 = x;
          return 2;
        })
        .with(3, (x) => {
          const check: 3 = x;
          return 2;
        })
        .run();
    });

    it('boolean literals', () => {
      type Input =
        | [true, true]
        | [false, true]
        | [false, false]
        | [true, false];
      const input = [true, true] as Input;

      match(input)
        .exhaustive()
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        .with([false, false], () => false)
        .run();
    });

    it('boolean literals', () => {
      type Input = [boolean, boolean];
      const input = [true, true] as Input;

      match(input)
        .exhaustive()
        .with([true, true], () => true)
        .with([false, true], () => false)
        .with([true, false], () => false)
        .with([false, false], () => false)
        .run();
    });

    it('union of objects', () => {
      type Input =
        | { type: 1; data: number }
        | { type: 'two'; data: string }
        | { type: 3; data: boolean }
        | { type: 4 }
        | { type: 'a' }
        | { type: 'b' }
        | { type: 'c' }
        | { type: 'd' }
        | { type: 'e' }
        | { type: 'f' }
        | { type: 'g' }
        | { type: 'h' }
        | { type: 'i' }
        | { type: 'j' }
        | { type: 'k' }
        | { type: 'l' }
        | { type: 'm' }
        | { type: 'n' }
        | { type: 'o' }
        | { type: 'p' };
      const input = { type: 1, data: 2 } as Input;

      match(input)
        .exhaustive()
        .with({ type: 1 }, (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ type: 1 }, (x) => 1)
        .with({ type: 'two' }, (x) => 2)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ type: 1 }, (x) => 1)
        .with({ type: 'two' }, ({ data }) => data.length)
        .with({ type: 3 }, () => 3)
        .with({ type: 4 }, () => 3)
        .with({ type: 'a' }, () => 0)
        .with({ type: 'b' }, () => 0)
        .with({ type: 'c' }, () => 0)
        .with({ type: 'd' }, () => 0)
        .with({ type: 'e' }, () => 0)
        .with({ type: 'f' }, () => 0)
        .with({ type: 'g' }, () => 0)
        .with({ type: 'h' }, () => 0)
        .with({ type: 'i' }, () => 0)
        .with({ type: 'j' }, () => 0)
        .with({ type: 'k' }, () => 0)
        .with({ type: 'l' }, () => 0)
        .with({ type: 'm' }, () => 0)
        .with({ type: 'n' }, () => 0)
        .with({ type: 'o' }, () => 0)
        .with({ type: 'p' }, () => 0)
        .run();

      match<Option<number>>({ kind: 'some', value: 3 })
        .exhaustive()
        .with({ kind: 'some' }, ({ value }) => value)
        .with({ kind: 'none' }, () => 0)
        .run();
    });

    it('union of tuples', () => {
      type Input = [1, number] | ['two', string] | [3, boolean];
      const input = [1, 3] as Input;

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', __], (x) => 2)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', __], ([_, data]) => data.length)
        .with([3, __], () => 3)
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', 'Hey'], ([_, data]) => data.length)
        .with(['two', __], ([_, data]) => data.length)
        .with([3, __], () => 3)
        .run();
    });

    it('deeply nested', () => {
      type Input =
        | [1, Option<number>]
        | ['two', Option<string>]
        | [3, Option<boolean>];
      const input = [1, { kind: 'some', value: 3 }] as Input;

      match(input)
        .exhaustive()
        .with([1, { kind: 'some' }], (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', __], (x) => 2)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with([1, __], (x) => 1)
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with([3, __], () => 3)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with(['two', { kind: 'none' }], () => 4)
        .with([1, __], () => 3)
        .with([3, __], () => 3)
        .run();
    });

    it('deeply nested', () => {
      type Input = ['two', Option<string>];
      const input = ['two', { kind: 'some', value: 'hello' }] as Input;

      match(input)
        .exhaustive()
        .with(['two', { kind: 'some' }], ([_, { value }]) => value.length)
        .with(['two', { kind: 'none' }], () => 4)
        .run();
    });

    it('should work with non-unions', () => {
      match<number>(2)
        .exhaustive()
        .with(2, () => 'two')
        .with(3, () => 'three')
        // @ts-expect-error
        .run();

      match<number>(2)
        .exhaustive()
        .with(2, () => 'two')
        .with(3, () => 'three')
        .with(__.number, () => 'something else')
        .run();

      match<string>('Hello')
        .exhaustive()
        .with('Hello', () => 'english')
        .with('Bonjour', () => 'french')
        // @ts-expect-error
        .run();

      match<string>('Hello')
        .exhaustive()
        .with('Hello', () => 'english')
        .with('Bonjour', () => 'french')
        .with(__, (c) => 'something else')
        .run();
    });

    it('should work with object properties union', () => {
      type Input = { value: 'a' | 'b' };
      const input = { value: 'a' } as Input;

      match(input)
        .exhaustive()
        .with({ value: 'a' }, (x) => 1)
        // @ts-expect-error
        .run();

      match(input)
        .exhaustive()
        .with({ value: __ }, (x) => 1)
        .run();

      match(input)
        .exhaustive()
        .with({ value: 'a' }, (x) => 1)
        .with({ value: 'b' }, (x) => 1)
        .run();
    });
  });
});
