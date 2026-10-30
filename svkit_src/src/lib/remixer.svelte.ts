export type Step = 'photo' | 'name' | 'bio' | 'botnet';
export type PickStep = Exclude<Step, 'botnet'>;

export const PICK_STEPS: { id: PickStep; label: string }[] = [
	{ id: 'photo', label: 'choose photo' },
	{ id: 'name', label: 'choose name' },
	{ id: 'bio', label: 'choose bio' }
];

export interface Bot {
	/** URL of the chosen avatar image */
	avatar: string | null;
	name: string | null;
	bio: string | null;
}

const FIELD = { photo: 'avatar', name: 'name', bio: 'bio' } as const satisfies Record<
	PickStep,
	keyof Bot
>;
const NEXT: Record<PickStep, PickStep> = { photo: 'name', name: 'bio', bio: 'bio' };

export const STORAGE_KEY = 'ira-remixer:bot';

type Store = Pick<Storage, 'setItem'>;

/** The remixer flow: which step is active, what the bot is made of, and what is hovered. */
export class Remixer {
	step = $state<Step>('photo');
	bot = $state<Bot>({ avatar: null, name: null, bio: null });
	/** Value under the pointer in the current step, shown on the bot before it is picked. */
	preview = $state<string | null>(null);
	/** True while a pick's transition plays; further picks and step changes are ignored. */
	busy = $state(false);

	done = $derived<Record<PickStep, boolean>>({
		photo: this.bot.avatar !== null,
		name: this.bot.name !== null,
		bio: this.bot.bio !== null
	});
	complete = $derived(this.done.photo && this.done.name && this.done.bio);

	#store: Store | null;

	constructor(store: Store | null = globalThis.localStorage ?? null) {
		this.#store = store;
	}

	go(step: Step) {
		if (this.busy) return;
		this.preview = null;
		this.step = step;
	}

	hover(value: string | null) {
		this.preview = value;
	}

	/** Sets the current step's value, waits for `transition`, then moves to the next step. */
	async pick(value: string, transition: () => Promise<void>) {
		if (this.busy || this.step === 'botnet') return;
		const step = this.step;
		this.busy = true;
		this.bot[FIELD[step]] = value;
		this.#save();
		try {
			await transition();
		} finally {
			this.busy = false;
		}
		this.go(NEXT[step]);
	}

	submit() {
		if (this.complete) this.go('botnet');
	}

	#save() {
		try {
			this.#store?.setItem(STORAGE_KEY, JSON.stringify(this.bot));
		} catch {
			// storage can be full or blocked; the bot just isn't remembered
		}
	}
}
