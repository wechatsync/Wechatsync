import { describe, expect, it, vi } from 'vitest'

import {
  dispatchLegacyMagicCall,
  LEGACY_MAGIC_CALL_METHOD_NOT_ALLOWED,
} from '../src/bridge/legacy-magic-call'

describe('dispatchLegacyMagicCall', () => {
  it.each([
    'checkAuth',
    'inspectPublication',
    'publish',
    'constructor',
    '__proto__',
    'toString',
  ])('does not dispatch the adapter method %s', async (methodName) => {
    const checkAuth = vi.fn()
    const inspectPublication = vi.fn()

    await expect(
      dispatchLegacyMagicCall(methodName, {
        account: { type: 'zhihu' },
        checkAuth,
        inspectPublication,
      }),
    ).resolves.toEqual({ error: LEGACY_MAGIC_CALL_METHOD_NOT_ALLOWED })
    expect(checkAuth).not.toHaveBeenCalled()
    expect(inspectPublication).not.toHaveBeenCalled()
  })

  it('rejects a non-string method name', async () => {
    await expect(dispatchLegacyMagicCall(null, {})).resolves.toEqual({
      error: LEGACY_MAGIC_CALL_METHOD_NOT_ALLOWED,
    })
  })
})
