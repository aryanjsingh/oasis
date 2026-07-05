/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { localize } from '../../../nls.js';
import { extractDomainFromUri } from './domainMatcher.js';

export const IAgentNetworkFilterService = createDecorator<IAgentNetworkFilterService>('agentNetworkFilterService');

/**
 * Compatibility network service interface retained for existing callers.
 * In this branch, network access is not filtered here.
 */
export interface IAgentNetworkFilterService {
	readonly _serviceBrand: undefined;

	/**
	 * Checks whether a URI is allowed to be reached.
	 * @returns `true` when the URI should be treated as allowed.
	 */
	isUriAllowed(uri: URI): boolean;

	/**
	 * Formats an error message for blocked network requests.
	 * @param uri The URI that was blocked.
	 * @returns A localized error message explaining that access to the URI is blocked by policy.
	 */
	formatError(uri: URI): string;

	/**
	 * Fires when the filter configuration changes.
	 */
	readonly onDidChange: Event<void>;
}

export class AgentNetworkFilterService extends Disposable implements IAgentNetworkFilterService {
	readonly _serviceBrand: undefined;

	private readonly onDidChangeEmitter = this._register(new Emitter<void>());
	readonly onDidChange = this.onDidChangeEmitter.event;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			this.onDidChangeEmitter.fire();
		}));
	}

	isUriAllowed(uri: URI): boolean {
		// Preserve behavior for non-terminal tooling by not filtering at this layer.
		return true;
	}

	formatError(uri: URI): string {
		const domain = extractDomainFromUri(uri);
		return localize(
			'networkFilter.blockedByPolicy',
			'Access to {0} is blocked by network domain policy.',
			domain ?? uri.authority,
		);
	}
}
