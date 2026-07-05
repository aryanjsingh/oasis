/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { AccessibleContentProvider, AccessibleViewProviderId, AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.js';
import { AccessibleViewRegistry, IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.js';
import { ActiveEditorContext } from '../../../common/contextkeys.js';
import { EditorExtensions } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { SurveyEditorInput } from './surveyEditorInput.js';
import { SurveyEditorPane } from './surveyEditorPane.js';

// Register editor pane
Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(
		SurveyEditorPane,
		SurveyEditorPane.ID,
		localize('surveyEditorPaneTitle', "Survey")
	),
	[new SyncDescriptor(SurveyEditorInput)]
);

// Accessibility help for the survey pane
class SurveyAccessibilityHelp implements IAccessibleViewImplementation {
	readonly priority = 100;
	readonly name = 'survey';
	readonly type = AccessibleViewType.Help;
	readonly when = ActiveEditorContext.isEqualTo(SurveyEditorPane.ID);

	getProvider(accessor: ServicesAccessor) {
		const editorService = accessor.get(IEditorService);
		const helpText = [
			localize('survey.help.overview', "You are in a survey form. Use Tab to move between questions and options."),
			localize('survey.help.select', "Use arrow keys within a question to navigate between options, and Space or Enter to select."),
			localize('survey.help.submit', "Tab to the Submit button and press Enter once the required question is answered. Additional questions are optional."),
		].join('\n');
		return new AccessibleContentProvider(
			AccessibleViewProviderId.Survey,
			{ type: AccessibleViewType.Help },
			() => helpText,
			() => { editorService.activeEditorPane?.focus(); },
			AccessibilityVerbositySettingId.Survey,
		);
	}
}

AccessibleViewRegistry.register(new SurveyAccessibilityHelp());
