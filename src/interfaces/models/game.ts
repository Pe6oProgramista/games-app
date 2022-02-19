import { Optional } from '../../utils';
import { IBase, BaseKeys } from './base';


export interface IGameAttr extends IBase {
    name: string
}

export interface IGameCreationAttr extends Optional<
    IGameAttr,
    BaseKeys
> { }

export interface IGameInstanceMethods {
    // some methods
}