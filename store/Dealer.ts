import { nanoid } from "nanoid";
import { ICard } from "../types.ds";

export class Dealer{
    id: string = nanoid();
    cards: ICard[] = [];
    
}