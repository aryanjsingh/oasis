/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { URI } from '../../../../base/common/uri.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { ConfigurationTarget } from '../../../configuration/common/configuration.js';
import { TestConfigurationService } from '../../../configuration/test/common/testConfigurationService.js';
import { AgentNetworkFilterService } from '../../common/networkFilterService.js';

suite('AgentNetworkFilterService', () => {

	let disposables: DisposableStore;
	let configService: TestConfigurationService;

	setup(() => {
		disposables = new DisposableStore();
		configService = new TestConfigurationService();
	});

	teardown(() => {
		disposables.dispose();
	});

	ensureNoDisposablesAreLeakedInTestSuite();

	async function createService(): Promise<AgentNetworkFilterService> {
		const service = new AgentNetworkFilterService(configService);
		disposables.add(service);
		return service;
	}

	function fireConfigChange(key: string): void {
		configService.onDidChangeConfigurationEmitter.fire({
			source: ConfigurationTarget.USER,
			affectedKeys: new Set([key]),
			change: { keys: [key], overrides: [] },
			affectsConfiguration: (k: string) => k === key,
		});
	}

	test('allows all http/https URIs', async () => {
		const service = await createService();
		assert.strictEqual(service.isUriAllowed(URI.parse('https://example.com')), true);
		assert.strictEqual(service.isUriAllowed(URI.parse('https://anything.test/path')), true);
	});

	test('allows file and non-authority URIs', async () => {
		const service = await createService();
		assert.strictEqual(service.isUriAllowed(URI.file('/tmp/test.txt')), true);
		assert.strictEqual(service.isUriAllowed(URI.from({ scheme: 'untitled', path: 'Untitled-1' })), true);
	});

	test('formatError includes the domain', async () => {
		const service = await createService();
		assert.strictEqual(service.formatError(URI.parse('https://example.com')), 'Access to example.com is blocked by network domain policy.');
	});

	test('fires onDidChange for configuration updates', async () => {
		const service = await createService();
		let fired = false;
		disposables.add(service.onDidChange(() => { fired = true; }));

		fireConfigChange('networkFilterSetting');

		assert.strictEqual(fired, true);
	});
});
