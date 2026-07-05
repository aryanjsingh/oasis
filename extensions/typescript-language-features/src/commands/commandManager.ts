/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export interface Command {
	readonly id: string;

	execute(...args: unknown[]): void | unknown;
}

export class CompositeCommand implements Command {
	public static readonly ID = '_typescript.composite';
	public readonly id = CompositeCommand.ID;

	public async execute(commands: readonly vscode.Command[]): Promise<void> {
		for (const command of commands) {
			await vscode.commands.executeCommand(command.command, ...(command.arguments ?? []));
		}
	}
}

export class CommandManager {
	private readonly commands = new Map<string, { refCount: number; readonly registration: vscode.Disposable }>();

	public dispose() {
		for (const registration of this.commands.values()) {
			registration.registration.dispose();
		}
		this.commands.clear();
	}

	public register<T extends Command>(command: T): vscode.Disposable {
		let entry = this.commands.get(command.id);
		if (!entry) {
			entry = { refCount: 1, registration: vscode.commands.registerCommand(command.id, command.execute, command) };
			this.commands.set(command.id, entry);
		} else {
			entry.refCount += 1;
		}

		return new vscode.Disposable(() => {
			entry.refCount -= 1;
			if (entry.refCount <= 0) {
				entry.registration.dispose();
				this.commands.delete(command.id);
			}
		});
	}
}
