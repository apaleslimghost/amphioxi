import { useMemo, useState } from 'preact/hooks'
import panel from './assets/panel.png'
import { FunctionComponent, JSX } from 'preact'

const SmallComponents = () => <>
  <option value="jack-mono">Mono jack</option>
  <option value="jack-stereo">Stereo jack</option>
  <option value="switch">Sub-mini toggle switch</option>
  <option value="button">LED button</option>
</>

const LargeComponents = () => <>
  <option value="potentiometer">Potentiometer</option>
  <option value="trimmer">Trimmer</option>
  <option value="encoder">Rotary encoder</option>
</>

const ComponentSelect: FunctionComponent<JSX.SelectHTMLAttributes & { type: 'small' | 'large' }> = (props) => <span className="component">
  <select {...props} class="component">
    <option value={undefined}></option>
    {props.type === 'large' ? <LargeComponents /> : <SmallComponents />}
  </select>
</span>

import jack from './assets/jack.png'
import potentiometer from './assets/potentiometer.png'
import encoder from './assets/encoder.png'
import trimmer from './assets/trimmer.png'
import sw from './assets/switch.png'
import button from './assets/button.png'
import { LargeComponent, RowComponents, SmallComponent, useStore } from './store'

const componentImages: Partial<Record<SmallComponent | LargeComponent, string>> = {
  "jack-mono": jack,
  "jack-stereo": jack,
  potentiometer,
  encoder,
  trimmer,
  switch: sw,
  button
}

const Component: FunctionComponent<{ component: SmallComponent | LargeComponent }> = ({ component }) => <span className={`component component--${component}`}>
  <img src={componentImages[component]} alt={component} />
</span>

const Row: FunctionComponent<{ column: number, row: number }> = ({ column, row }) => {
  const components = useStore(state => state.columns[column][row])
  const setComponents = useStore(state => state.setRowComponents)

  return <div class="row">
    {components ? (
      components.type === 'large' ?
        <Component component={components.centre} /> : <>
          {components.left ? <Component component={components.left} /> :
            <ComponentSelect type='small' onChange={event => setComponents(
              column, row,
              c => ({ ...(c as RowComponents & { type: 'small' }), left: event.currentTarget.value as SmallComponent })
            )} />
          }
          {components.right ? <Component component={components.right} /> :
            <ComponentSelect type='small' onChange={event => setComponents(
              column, row,
              c => ({ ...(c as RowComponents & { type: 'small' }), right: event.currentTarget.value as SmallComponent })
            )} />
          }
        </>
    ) : <>
      <ComponentSelect type='small' onChange={(event) => setComponents(
        column, row,
        () => ({ type: 'small', left: event.currentTarget.value as SmallComponent, right: undefined })
      )} />
      <ComponentSelect type='large' onChange={(event) => setComponents(
        column, row,
        () => ({ type: 'large', centre: event.currentTarget.value as LargeComponent })
      )} />
      <ComponentSelect type='small' onChange={(event) => setComponents(
        column, row,
        () => ({ type: 'small', right: event.currentTarget.value as SmallComponent, left: undefined })
      )} />
    </>}
  </div>
}

const Column: FunctionComponent<{ column: number }> = ({ column }) => <section class='column'>
  <img src={panel} alt="" />

  <Row column={column} row={0} />
  <Row column={column} row={1} />
  <Row column={column} row={2} />
  <Row column={column} row={3} />
  <Row column={column} row={4} />
  <Row column={column} row={5} />
</section>

export function App() {
  const columns = useStore(store => store.columns)
  const addColumn = useStore(store => store.addColumn)
  const removeColumn = useStore(store => store.removeColumn)

  return <>
    <section class="controls">
      <button onClick={() => addColumn()} disabled={columns.length >= 8}>+</button>
      <button onClick={() => removeColumn()} disabled={columns.length <= 1}>-</button>
    </section>
    <main className='panel'>
      {columns.map((_,i) =>
        <Column key={i} column={i} />
      )}
    </main>
  </>
}
