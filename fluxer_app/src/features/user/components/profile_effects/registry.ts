// SPDX-License-Identifier: AGPL-3.0-or-later

import {Bubbles} from '@app/features/user/components/profile_effects/Bubbles';
import {Confetti} from '@app/features/user/components/profile_effects/Confetti';
import type {ProfileEffectLayer} from '@app/features/user/components/profile_effects/effectKit';
import {Ember} from '@app/features/user/components/profile_effects/Ember';
import {Glitch} from '@app/features/user/components/profile_effects/Glitch';
import {Heartbeat} from '@app/features/user/components/profile_effects/Heartbeat';
import {RainyDay} from '@app/features/user/components/profile_effects/RainyDay';
import {SakuraDrift} from '@app/features/user/components/profile_effects/SakuraDrift';
import {Snowfall} from '@app/features/user/components/profile_effects/Snowfall';
import {SparkSurgeLayer} from '@app/features/user/components/profile_effects/SparkSurge';
import {Starlight} from '@app/features/user/components/profile_effects/Starlight';
import {Synthwave} from '@app/features/user/components/profile_effects/Synthwave';
import {PROFILE_EFFECT_IDS, type ProfileEffectId} from '@app/features/user/utils/ProfileEffectIds';
import type {MessageDescriptor} from '@lingui/core';
import {msg} from '@lingui/core/macro';

/**
 * Every Delight profile effect. To add one:
 *  1. add its id to PROFILE_EFFECT_IDS (features/user/utils/ProfileEffectIds.ts) and to the allow-list in
 *     delight/service/server.ts (or the DELIGHT_EFFECT_IDS env var of the delight-svc container);
 *  2. write a `ProfileEffectLayer` in this folder (see effectKit.tsx: it draws the 'back' or 'front' layer as an SVG in
 *     the card's pixel space; animate with transform/opacity only and make `[data-pfx-static]` show a still frame);
 *  3. register it below. The picker's tiles render it on a miniature card automatically (ProfileEffectThumbnail).
 */
export interface ProfileEffectDefinition {
	id: ProfileEffectId;
	name: MessageDescriptor;
	description: MessageDescriptor;
	Layer: ProfileEffectLayer;
}

const DEFINITIONS: Record<ProfileEffectId, Omit<ProfileEffectDefinition, 'id'>> = {
	spark_surge: {
		name: msg({message: 'Spark Surge', comment: 'Name of a profile effect: comic-style neon lightning and sparks.'}),
		description: msg({
			message: 'Neon flares, lightning and popping sparks.',
			comment: 'Short description of the Spark Surge profile effect.',
		}),
		Layer: SparkSurgeLayer,
	},
	sakura_drift: {
		name: msg({message: 'Sakura Drift', comment: 'Name of a profile effect: cherry blossom petals falling.'}),
		description: msg({
			message: 'Blossoming branches frame your card and shed petals.',
			comment: 'Short description of the Sakura Drift profile effect.',
		}),
		Layer: SakuraDrift,
	},
	snowfall: {
		name: msg({message: 'Snowfall', comment: 'Name of a profile effect: falling snow.'}),
		description: msg({
			message: 'An icy frame with icicles, frost and falling snow.',
			comment: 'Short description of the Snowfall profile effect.',
		}),
		Layer: Snowfall,
	},
	ember: {
		name: msg({message: 'Ember', comment: 'Name of a profile effect: flames and rising embers.'}),
		description: msg({
			message: 'Flames climb your card while sparks spiral up.',
			comment: 'Short description of the Ember profile effect.',
		}),
		Layer: Ember,
	},
	starlight: {
		name: msg({message: 'Starlight', comment: 'Name of a profile effect: twinkling stars and shooting stars.'}),
		description: msg({
			message: 'A night-sky frame with constellations and shooting stars.',
			comment: 'Short description of the Starlight profile effect.',
		}),
		Layer: Starlight,
	},
	heartbeat: {
		name: msg({message: 'Heartbeat', comment: 'Name of a profile effect: floating hearts and a pulse.'}),
		description: msg({
			message: 'Lace, a satin bow and glossy hearts that beat.',
			comment: 'Short description of the Heartbeat profile effect.',
		}),
		Layer: Heartbeat,
	},
	rainy_day: {
		name: msg({message: 'Rainy Day', comment: 'Name of a profile effect: rain and clouds.'}),
		description: msg({
			message: 'Rain on glass, storm clouds and an umbrella.',
			comment: 'Short description of the Rainy Day profile effect.',
		}),
		Layer: RainyDay,
	},
	bubbles: {
		name: msg({message: 'Bubbles', comment: 'Name of a profile effect: soap bubbles rising.'}),
		description: msg({
			message: 'Shimmering bubbles that wobble, rise and pop.',
			comment: 'Short description of the Bubbles profile effect.',
		}),
		Layer: Bubbles,
	},
	confetti: {
		name: msg({message: 'Confetti', comment: 'Name of a profile effect: confetti and streamers.'}),
		description: msg({
			message: 'Party poppers, bunting and tumbling confetti.',
			comment: 'Short description of the Confetti profile effect.',
		}),
		Layer: Confetti,
	},
	glitch: {
		name: msg({message: 'Glitch', comment: 'Name of a profile effect: digital RGB-split glitches.'}),
		description: msg({
			message: 'A glitching HUD frame with a target on your avatar.',
			comment: 'Short description of the Glitch profile effect.',
		}),
		Layer: Glitch,
	},
	synthwave: {
		name: msg({message: 'Synthwave', comment: 'Name of a profile effect: retro neon sunset and grid.'}),
		description: msg({
			message: 'A neon sunset over a rolling retro grid.',
			comment: 'Short description of the Synthwave profile effect.',
		}),
		Layer: Synthwave,
	},
};

export const PROFILE_EFFECTS: ReadonlyArray<ProfileEffectDefinition> = PROFILE_EFFECT_IDS.map((id) => ({
	id,
	...DEFINITIONS[id],
}));

export function getProfileEffectDefinition(id: ProfileEffectId): ProfileEffectDefinition {
	return {id, ...DEFINITIONS[id]};
}
