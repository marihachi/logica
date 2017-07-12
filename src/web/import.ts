const msgpack = require('msgpack-lite');

import Circuit from '../core/circuit';

import importNodes from '../core/import';

import And from '../core/nodes/and';
import And3 from '../core/nodes/and3';
import Or from '../core/nodes/or';
import Not from '../core/nodes/not';
import Nor from '../core/nodes/nor';
import Nand from '../core/nodes/nand';
import Xor from '../core/nodes/xor';
import Nop from '../core/nodes/nop';
import Random from '../core/nodes/random';
import Button from '../core/nodes/button';
import Led from '../core/nodes/led';
import Pin from '../core/nodes/pin';
import Package from '../core/nodes/package';
import PackageInput from '../core/nodes/package-input';
import PackageOutput from '../core/nodes/package-output';

import AndTag from './node-tags/and';
import And3Tag from './node-tags/and3';
import OrTag from './node-tags/or';
import NotTag from './node-tags/not';
import NorTag from './node-tags/nor';
import NandTag from './node-tags/nand';
import XorTag from './node-tags/xor';
import NopTag from './node-tags/nop';
import RandomTag from './node-tags/random';
import ButtonTag from './node-tags/button';
import LedTag from './node-tags/led';
import PinTag from './node-tags/pin';
import PackageTag from './node-tags/package';
import PackageInputTag from './node-tags/package-input';
import PackageOutputTag from './node-tags/package-output';

export default function (circuitBoard, data) {
	data = msgpack.decode(data);

	data.forEach(tagData => {
		let tag = null;
		if (tagData.node.type === 'And') tag = new AndTag(circuitBoard, And.import(tagData.node));
		if (tagData.node.type === 'And3') tag = new And3Tag(circuitBoard, And3.import(tagData.node));
		if (tagData.node.type === 'Or') tag = new OrTag(circuitBoard, Or.import(tagData.node));
		if (tagData.node.type === 'Not') tag = new NotTag(circuitBoard, Not.import(tagData.node));
		if (tagData.node.type === 'Nor') tag = new NorTag(circuitBoard, Nor.import(tagData.node));
		if (tagData.node.type === 'Nand') tag = new NandTag(circuitBoard, Nand.import(tagData.node));
		if (tagData.node.type === 'Xor') tag = new XorTag(circuitBoard, Xor.import(tagData.node));
		if (tagData.node.type === 'Nop') tag = new NopTag(circuitBoard, Nop.import(tagData.node));
		if (tagData.node.type === 'Random') tag = new RandomTag(circuitBoard, Random.import(tagData.node));
		if (tagData.node.type === 'Button') tag = new ButtonTag(circuitBoard, Button.import(tagData.node));
		if (tagData.node.type === 'Led') tag = new LedTag(circuitBoard, Led.import(tagData.node));
		if (tagData.node.type === 'Pin') tag = new PinTag(circuitBoard, Pin.import(tagData.node));
		if (tagData.node.type === 'Package') tag = new PackageTag(circuitBoard, Package.import(tagData.node));
		if (tagData.node.type === 'PackageInput') tag = new PackageInputTag(circuitBoard, PackageInput.import(tagData.node));
		if (tagData.node.type === 'PackageOutput') tag = new PackageOutputTag(circuitBoard, PackageOutput.import(tagData.node));
		tag.id = tagData.node.id;
		tag.x = tagData.x;
		tag.y = tagData.y;

		circuitBoard.tags.push(tag);

		circuitBoard.circuit.addNode(tag.node);
	});

	data.forEach(tagData => {
		tagData.node.outputs.forEach(output => {
			circuitBoard.tags.find(tag => tag.id === tagData.node.id).node.connectTo(
				circuitBoard.tags.find(tag => tag.id === output.nid).node,
				output.to,
				output.from
			);
		});
	});
}
