/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface TelemetryReporter {
	sendTelemetryEvent(eventName: string, properties?: Record<string, string>, measurements?: Record<string, number>): void;
	dispose(): Promise<void>;
}

export function createTelemetryReporter(): TelemetryReporter {
	return {
		sendTelemetryEvent() { /* noop */ },
		async dispose() { /* noop */ }
	};
}
