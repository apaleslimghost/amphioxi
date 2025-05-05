import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type SmallComponent =
  | "jack-mono"
  | "jack-stereo"
  | "switch"
  | "button"

export type LargeComponent = "potentiometer" | "trimmer" | "encoder"

export type RowComponents =
  | { type: 'large', centre: LargeComponent }
  | { type: 'small', left: SmallComponent | undefined, right: SmallComponent | undefined }

type Row = RowComponents | undefined

type Column = [
	Row,
	Row,
	Row,
	Row,
	Row,
	Row
]

type State = {
	columns: Column[],
	addColumn: () => void,
	removeColumn: () => void,
	setRowComponents: (c: number, r: number, co: (c: Row) => Row) => void,
	mode: 'panel' | 'pinout',
	toggleMode: () => void
}

export const useStore = create<State>()(
	persist(
		immer(
			(set) => ({
				mode: 'panel',
				columns: [
					[undefined, undefined, undefined, undefined, undefined, undefined]
				],
				addColumn: () => set(state => {
					state.columns.push([undefined, undefined, undefined, undefined, undefined, undefined])
				}),
				removeColumn: () => set(state => {
					state.columns.pop()
				}),
				setRowComponents: (column: number, row: number, components: (c: Row) => RowComponents) => set(state => {
					state.columns[column][row] = components(state.columns[column][row])
				}),
				toggleMode: () => set(state => {
					state.mode = (state.mode == 'panel') ? 'pinout' : 'panel'
				})
			}),
		),
		{
			name: 'amphioxi',
			storage: createJSONStorage(() => localStorage)
		}
	)
)

export const useSelectors = <Key extends keyof State>(keys: Key[]): Pick<State, Key> => {
	const s: Partial<State> = {}

	for(const k of keys) {
		s[k] = useStore(state => state[k])
	}

	return s as Pick<State, Key>
}
