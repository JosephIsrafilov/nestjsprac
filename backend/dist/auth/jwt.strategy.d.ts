import { Strategy } from 'passport-jwt';
import type { UserRole } from '../common/constants';
import { CurrentUser } from './auth.dto';
type JwtPayload = {
    sub: number;
    email: string;
    role: UserRole;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): CurrentUser;
}
export {};
