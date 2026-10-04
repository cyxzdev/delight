// SPDX-License-Identifier: AGPL-3.0-or-later

import {createContext, useContext, useLayoutEffect} from 'react';

/**
 * Lets popout content ask its popout to stay invisible for a moment (e.g. while a profile is still loading), so the
 * popout is positioned against its real size and doesn't jump after it has faded in. The popout reveals anyway after
 * a short cap, so slow content still shows its own loading state.
 */
export interface PopoutRevealController {
	setPending: (pending: boolean) => void;
}

export const PopoutRevealContext = createContext<PopoutRevealController | null>(null);

export function usePopoutRevealHold(pending: boolean): void {
	const controller = useContext(PopoutRevealContext);
	useLayoutEffect(() => {
		if (controller == null) return;
		controller.setPending(pending);
	}, [controller, pending]);
	useLayoutEffect(() => {
		if (controller == null) return;
		return () => controller.setPending(false);
	}, [controller]);
}
