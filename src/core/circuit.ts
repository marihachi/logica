import autobind from 'autobind-decorator';

import のーど from './node';
import Package from './nodes/package';
import PackageInput from './nodes/package-input';
import PackageOutput from './nodes/package-output';

/**
 * 回路
 */
@autobind
export default class Circuit {
	/**
	 * この回路に含まれているノード
	 */
	public nodes: Set<のーど> = new Set();

	private shouldUpdates: Set<のーど> = new Set();

	constructor(nodes?: のーど[]) {
		if (nodes) nodes.forEach(n => this.addNode(n));
	}

	/**
	 * 回路の状態を1(またはn)ステップ進めます
	 */
	public tick(n: number = 1) {
		for (let i = 0; i < n; i++) {

			//console.log('======================');
			/*console.log(Array.from(this.shouldUpdates).map((n: any) => {
				let log = `${n.type} ${n.name || '-'}`;
				if (n._reason) log += ` (${n._reason.type} ${n._reason.name || '-'}によって)`;
				return log;
			}).join('\n'));*/


			const inputs = [];

			Array.from(this.shouldUpdates).forEach((node, i) => {
				inputs[i] = {};
				if (node.inputInfo != null && node.inputInfo.length !== 0) {
					node.inputInfo.forEach(info => {
						inputs[i][info.id] = node.getInput(info.id);
					});
				}
			});

			const updatedNodes = [];

			Array.from(new Set(this.shouldUpdates)).forEach((node, i) => {
				this.shouldUpdates.delete(node);
				node.update(inputs[i]);
				updatedNodes.push(node);
			});

			updatedNodes.forEach(node => {
				if (node.outputInfo != null && node.outputInfo.length !== 0) {
					node.outputInfo.forEach(o => {
						if ((node as any).hasOwnProperty('_previousStates') && (node as any)._previousStates[o.id] === node.getState(o.id)) return;
						if (!(node as any).hasOwnProperty('_previousStates')) (node as any)._previousStates = {};
						(node as any)._previousStates[o.id] = node.getState(o.id);

						const next = node.getActualNextNodes(o.id);
						next.forEach(n => (n as any)._reason = node);
						next.forEach(n => this.shouldUpdates.add(n));
					});
				}
			});

/*
		console.log('======================');
		console.log(Array.from(this.nodes).map((n: any) => `${n.type} ${n.name || '-'} ${JSON.stringify(n.states)}`).join('\n'));
		console.log('======================');
*/
		}
	}

	/**
	 * 回路の状態の変化がなくなるまでtickします
	 */
	public calc(): number {
		let count = 0;
		while (this.shouldUpdates.size != 0) {
			this.tick();
			count++;
		}
		return count;
	}

	/**
	 * 回路の状態を初期状態に戻します
	 */
	public reset() {
		const dive = node => {
			node.init();
			node.emit('state-updated');
			node.emit('input-updated');
			this.scan(node);

			if (node.type === 'Package') {
				(node as Package).nodes.forEach(n => {
					dive(n);
				});
			}
		};
		this.nodes.forEach(n => dive(n));

		this.shouldUpdates.clear();
		this.nodes.forEach(n => this.scan(n));
	}

	public addNode(node: のーど) {
		this.nodes.add(node);
		this.scan(node);
	}

	private scan(node: のーど) {
		node.requestUpdateAtNextTick = () => this.shouldUpdates.add(node);
		if (node.isForceUpdate) this.shouldUpdates.add(node);
		if (node.type === 'Package') {
			(node as Package).nodes.forEach(n => {
				this.scan(n);
			});
		}
	}

	public removeNode(node: のーど) {
		this.nodes.delete(node);
		node.remove();
	}
}
