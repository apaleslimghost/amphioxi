import { create } from "zustand";
import { combine, createJSONStorage, persist } from "zustand/middleware";
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

export const useStore = create<{ columns: Column[], addColumn: () => void, removeColumn: () => void, setRowComponents: (c: number, r: number, co: (c: Row) => RowComponents) => void }>()(
	persist(
		immer(
			(set) => ({
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
				})
			}),
		),
		{
			name: 'amphioxi',
			storage: createJSONStorage(() => localStorage)
		}
	)
)
