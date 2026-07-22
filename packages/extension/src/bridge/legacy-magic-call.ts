export const LEGACY_MAGIC_CALL_METHOD_NOT_ALLOWED =
  'LEGACY_MAGIC_CALL_METHOD_NOT_ALLOWED'

type LegacyMagicCallHandler = (data: unknown) => unknown | Promise<unknown>

/**
 * The unrestricted legacy page channel currently has no authorized adapter
 * methods. Future compatibility methods must be added here as explicit,
 * validated handlers; never dispatch a page-provided name onto an adapter.
 */
const LEGACY_MAGIC_CALL_HANDLERS: Readonly<
  Record<string, LegacyMagicCallHandler>
> = Object.freeze({})

export interface LegacyMagicCallResponse {
  result?: unknown
  error?: string
}

export async function dispatchLegacyMagicCall(
  methodName: unknown,
  data: unknown,
): Promise<LegacyMagicCallResponse> {
  if (
    typeof methodName !== 'string' ||
    !Object.prototype.hasOwnProperty.call(
      LEGACY_MAGIC_CALL_HANDLERS,
      methodName,
    )
  ) {
    return { error: LEGACY_MAGIC_CALL_METHOD_NOT_ALLOWED }
  }

  try {
    return { result: await LEGACY_MAGIC_CALL_HANDLERS[methodName](data) }
  } catch {
    return { error: 'LEGACY_MAGIC_CALL_FAILED' }
  }
}
