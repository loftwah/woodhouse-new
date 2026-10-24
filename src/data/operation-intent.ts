/**
 * One owner for a repeatable action. Every activation takes a token; a late
 * response may update the interface only while its token is current. Starting a
 * newer action, timing out or cancelling retires the older token, so a slow
 * request cannot overwrite a newer intent.
 */
export type OperationIntent = {
  begin(): number;
  isCurrent(token: number): boolean;
  cancel(): void;
};

export function createOperationIntent(): OperationIntent {
  let current = 0;
  return {
    begin() {
      current += 1;
      return current;
    },
    isCurrent(token) {
      return token === current;
    },
    cancel() {
      current += 1;
    }
  };
}
