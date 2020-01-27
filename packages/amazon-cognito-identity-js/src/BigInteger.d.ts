type Radix = 2 | 4 | 8 | 16 | 32;

export default class BigInteger {
	public static readonly ONE: BigInteger;
	public static readonly ZERO: BigInteger;

	public am: any;
	public DB: number;
	public DM: number;
	public DV: number;
	public FV: number;
	public F1: number;
	public F2: number;

	constructor(a: string | null, b: Radix);
	public toString(b): string;
	public negate(): BigInteger;
	public abs(): BigInteger;
	public compareTo(a: BigInteger): number;
	public bitLength(): number;
	public mod(a: any): BigInteger;
	public equals(a: any): boolean;
	public add(a: BigInteger, r?: any): BigInteger;
	public subtract(a: any): BigInteger;
	public multiply(a: BigInteger): BigInteger;
	public divide(a: any): BigInteger;
	public modPow(
		e,
		m,
		callback: (error: null, result: BigInteger) => void
	): BigInteger;

	protected copyTo(r: any): void;
	protected fromInt(x: number): void;
	protected fromString(s: string, b: Radix): void;
	protected clamp(): void;
	protected dlShiftTo(n: any, r: any): void;
	protected drShiftTo(n: any, r: any): void;
	protected lShiftTo(n: any, r: any): void;
	protected rShiftTo(n: any, r: any): any;
	protected subTo(a: any, r: any): void;
	protected multiplyTo(a: any, r: any): void;
	protected squareTo(r: any): void;
	protected divRemTo(m, q, r): void;
	protected invDigit(): number;
	protected addTo(a: any, r: any): void;
}
