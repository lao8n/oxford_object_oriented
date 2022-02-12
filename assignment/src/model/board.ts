import { Card } from './card';
import { Deed } from './deed';
import { FreeParking } from './free_parking';
import { Go } from './go';
import { GoToJail } from './gotojail';
import { Jail } from './jail';
import { Money } from './money';
import { Tax } from './tax';
import { Train } from './train';
import { Utility } from './utility';

export type Location = {
    readonly street : BoardStreet,
    readonly num : BoardNumber
}
export type BoardStreet = 1 | 2 | 3 | 4
export const boardstreets: BoardStreet[] = [1, 2, 3, 4]
export type BoardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export const boardnumbers: BoardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/**
 * Assignment notes
 * - We use a nested Readonly implementation to make board read-only
 * - We iterate over BoardStreet and BoardNumber types to give types to indices
 *   rather than [S in keyof ConcreteBoard<M>][P in keyof ConcreteBoard<M>[S]] 
 */
export type MonopolyBoard<M extends Money> = {
    readonly [S in BoardStreet] : 
        {readonly [N in BoardNumber] : 
            ConcreteBoard<M>[S][N]
    }
}

/**
 * 
 * 
 * Assignment notes
 * - We make all board locations a Space rather than a specific type and
 *   optional
 */
export type GenericBoard<M extends Money> = {
    readonly [S in BoardStreet]? : { readonly [N in BoardNumber]? : Space<M>}
}

/**
 * Assignment notes
 * - We use the keyof operator to get all the types of space on the monopoly 
 *   board which will automatically update with inline with MonopolyBoard type
 */
export type Space<M extends Money> = 
    ConcreteBoard<M>[
        keyof ConcreteBoard<M> // 1, 2, 3, 4
    ][
        keyof ConcreteBoard<M>[ // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            keyof ConcreteBoard<M>
        ] 
    ]


/**
 * Every location on the board has a specific type of Space that must occupy it
 * giving us type-safety.
 *
 * Assignment notes
 * - 
 */
type ConcreteBoard<M extends Money>  = {
    1: {
        1: Go<M>,
        2: Deed<M>,
        3: Card<M>,
        4: Deed<M>,
        5: Tax<M>,
        6: Train<M>,
        7: Deed<M>,
        8: Card<M>,
        9: Deed<M>,
        10: Deed<M>,
    },
    2: {
        1: Jail,
        2: Deed<M>,
        3: Utility<M>,
        4: Deed<M>,
        5: Deed<M>,
        6: Train<M>,
        7: Deed<M>,
        8: Card<M>,
        9: Deed<M>,
        10: Deed<M>,
    },
    3: {
        1: FreeParking,
        2: Deed<M>,
        3: Card<M>,
        4: Deed<M>,
        5: Deed<M>,
        6: Train<M>,
        7: Deed<M>,
        8: Deed<M>,
        9: Utility<M>,
        10: Deed<M>,
    },
    4: {
        1: GoToJail,
        2: Deed<M>,
        3: Deed<M>,
        4: Card<M>,
        5: Deed<M>,
        6: Train<M>,
        7: Card<M>,
        8: Deed<M>,
        9: Tax<M>,
        10: Deed<M>,
    },
}
