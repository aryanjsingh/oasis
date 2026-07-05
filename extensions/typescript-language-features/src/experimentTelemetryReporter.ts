/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as tas from 'vscode-tas-client';

export interface IExperimentationTelemetryReporter extends tas.IExperimentationTelemetry, vscode.Disposable {
	postEventObj(eventName: string, props: { [prop: string]: string }): void;
}

interface BaseTelemetryReporter {
	sendTelemetryEvent(eventName: string, props?: { [prop: string]: string }): void;
	dispose(): void;
}

const noopBaseTelemetryReporter: BaseTelemetryReporter = {
	sendTelemetryEvent() { /* noop */ },
	dispose() { /* noop */ }
};

/**
 * This reporter *supports* experimentation telemetry,
 * but will only do so when passed to an {@link ExperimentationService}.
 */

export class ExperimentationTelemetryReporter implements IExperimentationTelemetryReporter {

	private _sharedProperties: Record<string, string> = {};
	private readonly _reporter: BaseTelemetryReporter;

	constructor(reporter: BaseTelemetryReporter) {
		this._reporter = reporter;
	}

	setSharedProperty(name: string, value: string): void {
		this._sharedProperties[name] = value;
	}

	postEvent(eventName: string, props: Map<string, string>): void {
		const propsObject = {
			...this._sharedProperties,
			...Object.fromEntries(props),
		};
		this._reporter.sendTelemetryEvent(eventName, propsObject);
	}

	postEventObj(eventName: string, props: { [prop: string]: string }) {
		this._reporter.sendTelemetryEvent(eventName, {
			...this._sharedProperties,
			...props,
		});
	}

	dispose() {
		this._reporter.dispose();
	}
}

export function createExperimentationTelemetryReporter(): IExperimentationTelemetryReporter {
	return new ExperimentationTelemetryReporter(noopBaseTelemetryReporter);
}
