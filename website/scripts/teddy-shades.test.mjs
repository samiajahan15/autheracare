import test from 'node:test';
import assert from 'node:assert/strict';
import { groupShadeCards, isTeddyTint, teddyShade } from '../src/lib/catalog/shades.ts';
const p=(id,name)=>({id,name,brand:'Maybelline',category:'Lip care'});
test('one card per shade family while keeping other products',()=>{const teddy=p('t1','Super Stay Teddy Tint – Shade 25 Baby Tee'),lumi=p('l1','Super Stay Lumi Matte Foundation Shade 120'),other=p('o','Mascara');assert.deepEqual(groupShadeCards([teddy,p('t2','Super Stay Teddy Tint – Shade 30 Coquettish'),lumi,p('l2','Super Stay Lumi Matte Foundation Shade 125'),other]),[teddy,lumi,other]);});
test('Teddy shade names retain number and full name',()=>{assert.equal(teddyShade(p('t','Super Stay Teddy Tint – Shade 70 The A+')),'70 · The A+');assert.equal(isTeddyTint(p('x','Super Stay Lumi Matte Foundation')),false);});
