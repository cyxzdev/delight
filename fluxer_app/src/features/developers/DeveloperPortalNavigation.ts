// SPDX-License-Identifier: AGPL-3.0-or-later

import {DeveloperPortalPaths} from '@app/features/developers/DeveloperPortalPaths';
import {transitionTo} from '@app/features/navigation/utils/RouterUtils';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';

/** Closes any open modals (e.g. user settings) and opens the full-page developer portal. */
export function openDeveloperPortal(path: string = DeveloperPortalPaths.APPLICATIONS): void {
	ModalCommands.popAll();
	transitionTo(path);
}
