import { UserPerm } from '../../enums';
import { Optional } from '../../utils';
import { IBase, BaseKeys } from './base';


export interface IUserAttr extends IBase {
    username: string;
    password: string;
    email: string;
    permissions: UserPerm
}

export interface IUserCreationAttr extends Optional<
    IUserAttr,
    BaseKeys | 'permissions'
> { }

export interface IUserInstanceMethods {
    comparePasswords: (password: string) => Promise<boolean>;
}

// export class A {
//     b?: string;
//     a?: number;
// }

// const modal: IUser = {
//     username: "string",
//     password: "string",
//     email: "string;",
//     id: 0,
//     createdAt: new Date(),
//     updatedAt: new Date()
// };

// let a : Optional<IUser, "username"> = {
//     password: "dsda",
//     email: "zczc",createdAt: new Date(), id: 5, updatedAt: new Date()
// }
// console.log(typeof a);

// export interface IUser2 extends Optional<IUser, BaseKeys | "email"> {}
// type Krr = "dsds" | "sdas";



// type Complete<T> = {
//     [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : (T[P] | undefined);
// }