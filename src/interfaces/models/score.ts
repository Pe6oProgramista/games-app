import { Optional } from '../../utils';
import { IBase, BaseKeys } from './base';


export interface IScoreAttr extends IBase {
    user_id: number;
    game_id: number;
    score: number;
}

export interface IScoreCreationAttr extends Optional<
    IScoreAttr,
    BaseKeys
> { }

export interface IScoreInstanceMethods {
    // some methods ...
}