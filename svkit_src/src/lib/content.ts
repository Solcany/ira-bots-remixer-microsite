import type { PickStep } from './remixer.svelte.ts';

export const INTRO = [
	'Internet Research Agency is a Russian institution responsible for the trolls and bots that consolidated tribalism and polarisation of US population before and during the 2016 elections. The agency’s medium of the greatest influence were the popular social networks.',
	'My website asks visitors to remix the data from the agency’s bots’ Twitter profiles to create new fictional Twitter bots. By providing a hands-on experience on the processes of the agency I hope to make people better prepared to recognise the real malicious bots.'
];

// TODO: the name and bio copy were still lorem ipsum in the original prototype.
const LOREM =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et sem ipsum. Nulla ipsum felis, dictum sit amet gravida vel, convallis non dolor. Nullam aliquet, lacus eget pretium dapibus, orci justo dignissim magna, a ullamcorper tortor sapien at tellus.';

export const STEP_COPY: Record<PickStep, { title: string; body: string }> = {
	photo: {
		title: 'a bot needs a face',
		body: 'Make sure that your bot has a photo, the ‘silhouette’ avatar is a red flag that a Twitter account is a bot. Avoid choosing non-human photos because these are also a red flag. The less personal information your bot presents the more suspicious in general it is.'
	},
	name: { title: 'a bot needs a name', body: LOREM },
	bio: { title: 'a bot needs a description', body: LOREM }
};
