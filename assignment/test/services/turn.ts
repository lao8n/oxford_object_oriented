import * as _chai from 'chai';
import { DataFactory } from '../../data/uk';
import { Board } from '../../src/components/board';
import { Owner, Ownership } from '../../src/components/ownership';
import { Players } from "../../src/components/players";
import { Transfer } from '../../src/services/transfer';
import { ConcreteTurn, TurnFinish, TurnOwnedProperty, TurnRoll, TurnUnownedProperty } from '../../src/services/turn';
import { GenericBoard, MonopolyBoard } from '../../src/types/board';
import * as money from "../../src/types/money";

describe('service turn constructor', () => {
    it('can construct turn with GBP currency', 
    () => {
        let m = DataFactory.createMonopolyBoard<money.GBP>()
        let b = new Board<money.GBP, MonopolyBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, MonopolyBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, MonopolyBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, MonopolyBoard<money.GBP>>(
            b, p, o, t)
        _chai.assert.instanceOf(c, ConcreteTurn);
    });
});

describe('service turn start', () => {
    it('returns interface with correct type', 
    () => {
        let m = DataFactory.createMonopolyBoard<money.GBP>()
        let b = new Board<money.GBP, MonopolyBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, MonopolyBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, MonopolyBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, MonopolyBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        tr = c.start()
        _chai.assert.typeOf(tr.roll, "function")
        _chai.assert.equal(tr.stage, "Roll")
        _chai.assert.equal(tr.player, 1)
    });
});

describe('service turn roll', () => {
    it('roll returns either UnownedProperty or OwnedProperty or TurnFinish', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        tr = c.start()
        let trResult = tr.roll(tr.player)
        _chai.assert.oneOf(trResult.stage, 
            ["Roll", "UnownedProperty", "OwnedProperty", "Finish"] )
        _chai.assert.equal(trResult.player, 1)
    });
    it('roll unchanged if different player calls', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        tr = c.start()       
        let trResult = tr.roll(2)
        _chai.assert.equal(trResult.stage, "Roll")
        _chai.assert.equal(trResult.player, 1)
    });
});

describe('service turn buyProperty', () => {
    it('buy property returns TurnFinish', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        let tu : TurnUnownedProperty
        let tf : TurnFinish
        tr = c.start()
        let trResult = tr.roll(tr.player)
        while(trResult.stage != "UnownedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        tu = trResult
        _chai.assert.equal(tu.stage, "UnownedProperty")
        let tuResult = tu.buyProperty(tu.player)
        while(tuResult.stage != "Finish"){
            tuResult = tu.buyProperty(tu.player)
        }
        _chai.assert.equal(tuResult.stage, "Finish")
    });
    it('buy property unchanged if different player calls it', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        let tu : TurnUnownedProperty
        let tf : TurnFinish
        tr = c.start()
        let trResult = tr.roll(tr.player)
        while(trResult.stage != "UnownedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        tu = trResult
        let notTurnPlayer = p.getCurrentTurnNotPlayer()
        let tuResult = tu.buyProperty(notTurnPlayer)
        _chai.assert.equal(tuResult.stage, "UnownedProperty")
        _chai.assert.notEqual(tuResult.player, notTurnPlayer)
        _chai.assert.equal(tuResult.player, tu.player)
    });
});

describe('service turn payRent', () => {
    it('pay rent returns TurnFinish', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        let tu : TurnUnownedProperty
        let tf : TurnFinish
        let to : TurnOwnedProperty
        tr = c.start()
        let trResult = tr.roll(tr.player)
        while(trResult.stage != "UnownedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        tu = trResult
        let tuResult = tu.buyProperty(tu.player)
        while(tuResult.stage != "Finish"){
            tuResult = tu.buyProperty(tu.player)
        }
        tf = tuResult
        let tfResult = tf.finishTurn(tf.player)
        while(tfResult.stage != "Roll"){
            tfResult = tf.finishTurn(tf.player)
        }
        tr = tfResult
        trResult = tr.roll(tr.player)
        while(trResult.stage != "OwnedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        to = trResult
        let toResult = to.payRent(to.player)
        while(toResult.stage != "Finish"){
            toResult = to.payRent(to.player)
        }
        _chai.assert.equal(toResult.stage, "Finish")
    });
    it('pay rent unchanged if different player calls it', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        let tu : TurnUnownedProperty
        let tf : TurnFinish
        let to : TurnOwnedProperty
        tr = c.start()
        let trResult = tr.roll(tr.player)
        while(trResult.stage != "UnownedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        tu = trResult
        let tuResult = tu.buyProperty(tu.player)
        while(tuResult.stage != "Finish"){
            tuResult = tu.buyProperty(tu.player)
        }
        tf = tuResult
        let tfResult = tf.finishTurn(tf.player)
        while(tfResult.stage != "Roll"){
            tfResult = tf.finishTurn(tf.player)
        }
        tr = tfResult
        trResult = tr.roll(tr.player)
        while(trResult.stage != "OwnedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        to = trResult
        let notTurnPlayer = p.getCurrentTurnNotPlayer()
        let toResult = to.payRent(notTurnPlayer)
        _chai.assert.equal(toResult.stage, "OwnedProperty")
        _chai.assert.equal(toResult.player, to.player)
        _chai.assert.notEqual(toResult.player, notTurnPlayer)
    });
});

describe('service finishTurn', () => {
    it('finish returns roll', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        let tu : TurnUnownedProperty
        let tf : TurnFinish
        tr = c.start()
        let trResult = tr.roll(tr.player)
        while(trResult.stage != "UnownedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        tu = trResult
        let previousTurnPlayer = tu.player
        let tuResult = tu.finishTurn(tu.player)
        _chai.assert.equal(tuResult.stage, "Roll")
        _chai.assert.notEqual(tuResult.player, previousTurnPlayer)
    });
    it('finish unchanged if different player calls it', 
    () => {
        let m = DataFactory.createTestBoard3<money.GBP>()
        let b = new Board<money.GBP, GenericBoard<money.GBP>>(m)
        let p = new Players<money.GBP>(4)
        let o = new Ownership<money.GBP, GenericBoard<money.GBP>>(m)
        let t = new Transfer<money.GBP, GenericBoard<money.GBP>>(b, p, o)
        let c = new ConcreteTurn<money.GBP, GenericBoard<money.GBP>>(
            b, p, o, t)
        let tr : TurnRoll
        let tu : TurnUnownedProperty
        let tf : TurnFinish
        tr = c.start()
        let trResult = tr.roll(tr.player)
        while(trResult.stage != "UnownedProperty"){
            trResult = tr.roll(tr.player)
            if(trResult.stage == "Finish"){
                tf = trResult
                let tfResult = tf.finishTurn(tf.player)
                while(tfResult.stage != "Roll"){
                    tfResult = tf.finishTurn(tf.player)
                }
                tr = tfResult
            }
        }
        tu = trResult
        let previousTurnPlayer = tu.player
        let notTurnPlayer = p.getCurrentTurnNotPlayer()
        let tuResult = tu.finishTurn(notTurnPlayer)
        _chai.assert.equal(tuResult.stage, "UnownedProperty")
        _chai.assert.equal(tuResult.player, previousTurnPlayer)
    });
});
