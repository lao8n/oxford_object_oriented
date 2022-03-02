"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ownership = void 0;
const board = __importStar(require("../types/board"));
/**
 * Ownership service to manage which properties are owned by which players.
 */
class Ownership {
    /**
     * @param monopolyboard {@link GenericBoard} which is used to build the
     * map of space names to owners in {@link ownership}
     */
    constructor(monopolyboard) {
        this.monopolyboard = monopolyboard;
        /**
         * We use a {@link Map} data structure to efficiently store the name of a
         * space as a key and the {@link Owner} as a value.
         */
        this.ownership = new Map();
        this.initOwnership(this.monopolyboard);
    }
    /**
     * Initialise the ownership map, where if an empty {@link Space} is found
     * on the {@link GenericBoard} (for example as with
     * {@link createTestBoard2}) we do not incorrectly add that
     * {@link Space.name} to the {@link ownership} map as it is inaccessible
     *
     * Assignment notes
     * - Optional chaining ?. to get nested access when reference might be
     *   undefined
     * - Strict check === to differentiate between undefined which means not
     *   yet defined for new spaces and null which means an absence of a value
     *   which is what we initialize to
     * - Partial discrimination to distinguish ownable spaces from non-ownable
     * - for...of loops
     */
    initOwnership(b) {
        for (const bs of board.boardstreets) {
            for (const bn of board.boardnumbers) {
                // reached end of board
                const space = b?.[bs]?.[bn];
                if (!space) {
                    return;
                }
                // safe as already checked that these are defined and kind and 
                // name must exist
                const kind = space.kind;
                const name = space.name;
                const isDeed = kind == "Deed";
                const isTrain = kind == "Train";
                const isUtility = kind == "Utility";
                const canBeOwned = isDeed || isTrain || isUtility;
                if (canBeOwned) {
                    if (this.ownership.get(name) === null) {
                        throw new Error(`Inputted board has non-unique space` +
                            ` names where ${name} already exists`);
                    }
                    else {
                        this.ownership.set(name, null);
                    }
                }
            }
        }
    }
    /**
     * @param name The name of the {@link Space}
     * @returns Whether there is an {@link Owner} or not.
     */
    getOwner(name) {
        return this.ownership.get(name);
    }
    /**
     * Method to buy properties. It only looks after change in ownership and
     * not change in {@link Player.wealth} which is done by {@link Transfer}
     * @param player Player who wishes to buy
     * @param name Name of property they wish to buy
     * @param setNames Names of properties in that colour set, this is added
     * as an argument so {@link Owner} can be updated with {@link sameOwner}
     * if that is true, making queries for {@link payRent} which doubles if
     * all properties owned faster
     *
     * @throws Error if {@link name} not in {@link setNames}
     *
     * Assignment notes
     * - for...of loops
     */
    acquire(player, name, setNames) {
        // validate
        if (!setNames.includes(name)) {
            throw new Error(`Invalid setNames does not include ${name}`);
        }
        if (this.getOwner(name) === null) {
            this.ownership.set(name, { id: player, sameOwner: false });
            const sameOwner = this.sameOwner(player, setNames);
            if (sameOwner) {
                for (const sn of setNames) {
                    this.ownership.set(sn, { id: player, sameOwner: true });
                }
            }
            return true;
        }
        // if name doesn't exist or is already owned
        return false;
    }
    /**
     * Method to release a property from ownership of a player. Although this
     * works and this is tested, this is not currently exposed by the
     * {@link Turn} API, but it could be added in the future
     *
     * @param player PlayerID who wishes to release a property
     * @param name Name of the property
     * @param setNames Names of properties in that set e.g. trains
     * @returns Boolean indicating whether release was successful or not
     *
     * @throws Error if {@link setNames} is invalid
     */
    release(player, name, setNames) {
        // validate
        if (!setNames.includes(name)) {
            throw new Error(`Invalid setNames does not include ${name}`);
        }
        if (setNames.length < 2 || setNames.length > 4) {
            throw new Error(`Inputted set is invalid, it has length ` +
                `${setNames.length} but it must have at least 2 ` +
                `and at most 4 entries`);
        }
        if (this.getOwner(name)?.id == player) {
            for (const sn of setNames) {
                this.ownership.set(sn, { id: player, sameOwner: false });
            }
            this.ownership.set(name, null);
            return true;
        }
        // if property doesn't exist, not owned, or owned by another player
        return false;
    }
    /**
     * Private method to determine whether all properties in a set have the
     * same owner, with implications for {@link payRent} and
     * {@link buyHouseOrHotel}
     *
     * @param player Player to check
     * @param setNames Names of properties to check
     * @returns Boolean flag for whether all have the {@link sameOwner}
     *
     * @throws Error if {@link setNames} is invalid
     *
     * Assignment notes
     * - use functional methods {@link map} and {@link reduce} to replicate
     *   fold logic
     */
    sameOwner(player, setNames) {
        // validate
        if (setNames.length < 2 || setNames.length > 4) {
            throw new Error(`Inputted set is invalid, it has length ` +
                `${setNames.length} but it must have at least 2 ` +
                `and at most 4 entries`);
        }
        return setNames.map(name => this.ownership.get(name)?.id == player)
            .reduce((acc, cv) => acc && cv, true);
    }
}
exports.Ownership = Ownership;
