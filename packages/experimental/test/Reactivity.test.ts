import { Reactivity } from "@effect/experimental"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("Reactivity", () => {
  it.effect("query stops rerunning its effect after a failure ends the mailbox", () =>
    Effect.gen(function*() {
      const reactivity = yield* Reactivity.make
      let runs = 0
      const failed = yield* reactivity.query(
        ["todos"],
        Effect.suspend(() => {
          runs++
          return Effect.fail("boom")
        })
      )
      const live = yield* reactivity.query(["todos"], Effect.succeed(42))
      assert.strictEqual(yield* Effect.flip(failed.take), "boom")
      assert.strictEqual(yield* live.take, 42)
      yield* reactivity.invalidate(["todos"])
      assert.strictEqual(yield* live.take, 42)
      assert.strictEqual(runs, 1)
    }).pipe(Effect.scoped))

  it.effect("closing the scope of a failed query does not throw", () =>
    Effect.gen(function*() {
      const reactivity = yield* Reactivity.make
      const failed = yield* reactivity.query(["todos"], Effect.fail("boom"))
      assert.strictEqual(yield* Effect.flip(failed.take), "boom")
    }).pipe(Effect.scoped))
})
