export declare function ErrNotDefined(varName: string): ReferenceError
export declare function ErrImplement(varName: string): SyntaxError
export declare function ErrDuplicateDeclard(varName: string): SyntaxError
export declare function ErrIsNot(name: string, type: string): TypeError
export declare function ErrInvalidIterable(name: any): TypeError
export declare function ErrNoSuper(): ReferenceError
export declare function ErrIsNotFunction(name: string): ReferenceError
export declare function ErrCanNotReadProperty(
  property: string,
  target: string
): ReferenceError
