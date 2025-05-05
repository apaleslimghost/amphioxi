import { FunctionComponent, JSX } from 'preact'
import { LargeComponent, RowComponents, SmallComponent, useSelectors, useStore } from './store'

import panel from './assets/panel.png'
import jack from './assets/jack.png'
import potentiometer from './assets/potentiometer.png'
import encoder from './assets/encoder.png'
import trimmer from './assets/trimmer.png'
import sw from './assets/switch.png'
import button from './assets/button.png'

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

const componentImages: Record<SmallComponent | LargeComponent, string> = {
  "jack-mono": jack,
  "jack-stereo": jack,
  potentiometer,
  encoder,
  trimmer,
  switch: sw,
  button
}

type LargeComponentPinout = [string, string, string, string, string, string]
type SmallComponentPinout = [string, string, string]

const largeComponentPinouts: Record<LargeComponent, LargeComponentPinout> = {
  potentiometer: ['switch 1', 'switch 2', '×', '1', '2', '3'],
  trimmer: ['×', '×', '×', '1', '2', '3'],
  encoder: ['switch 1', 'switch 2', '×', 'A', 'C', 'B']
}

const smallComponentPinouts: Record<SmallComponent, SmallComponentPinout> = {
  'jack-mono': ['sleeve', 'tip', 'normal'],
  'jack-stereo': ['sleeve', 'tip', 'ring'],
  switch: ['1', '3', '2'],
  button: ['1', '2/LED K', 'LED A']
}

const Component: FunctionComponent<{ component: SmallComponent | LargeComponent }> = ({ component }) => <span className={`component component--${component}`}>
  <img src={componentImages[component]} alt={component} />
</span>

const Row: FunctionComponent<{ column: number, row: number }> = ({ column, row }) => {
  const components = useStore(state => state.columns[column][row])
  const setRowComponents = useStore(state => state.setRowComponents)
  const setComponents = setRowComponents.bind(null, column, row)

  return <div class="row">
    {components ? (
      components.type === 'large' ?
        <Component component={components.centre} /> : <>
          {components.left ? <Component component={components.left} /> :
            <ComponentSelect type='small' onChange={event => setComponents(
              c => ({ ...(c as RowComponents & { type: 'small' }), left: event.currentTarget.value as SmallComponent })
            )} />
          }
          {components.right ? <Component component={components.right} /> :
            <ComponentSelect type='small' onChange={event => setComponents(
              c => ({ ...(c as RowComponents & { type: 'small' }), right: event.currentTarget.value as SmallComponent })
            )} />
          }
        </>
    ) : <>
      <ComponentSelect type='small' onChange={(event) => setComponents(
        () => ({ type: 'small', left: event.currentTarget.value as SmallComponent, right: undefined })
      )} />
      <ComponentSelect type='large' onChange={(event) => setComponents(
        () => ({ type: 'large', centre: event.currentTarget.value as LargeComponent })
      )} />
      <ComponentSelect type='small' onChange={(event) => setComponents(
        () => ({ type: 'small', right: event.currentTarget.value as SmallComponent, left: undefined })
      )} />
    </>}
  </div>
}

const PanelColumn: FunctionComponent<{ column: number }> = ({ column }) => <section class='column column--panel'>
  <img src={panel} alt="" />

  <Row column={column} row={0} />
  <Row column={column} row={1} />
  <Row column={column} row={2} />
  <Row column={column} row={3} />
  <Row column={column} row={4} />
  <Row column={column} row={5} />
</section>

const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F']

const Pinout: FunctionComponent<{location: 'top' | 'bottom', column: number}> = ({ column, location }) => {
  const rowIndex = location === 'top' ? 0 : 3
  const col = useStore(state => state.columns[column])
  const rows = col.slice(rowIndex, rowIndex + 3)

  return <section class={`pinout pinout--${location}`}>
    <ol className='pins pins--bus'>
      <li><span className='pin-label'>-</span></li>
      <li><span className='pin-label'>+</span></li>
    </ol>
    {rows.map((row, i) => <ol className='pins'>
      <h4>{rowLabels[rowIndex + i]}</h4>

      {!row ? Array.from({length: 6}, () => <li>&times;</li>) :
      row.type === 'large' ? <>
        {largeComponentPinouts[row.centre].map(
          label => <li><span className='pin-label'>{label}</span></li>
        )}
      </> : <>
        {row.left ? smallComponentPinouts[row.left].map(
          label => <li><span className='pin-label'>{label}</span></li>
        ) : Array.from({length: 3}, () => <li><span className='pin-label'>&times;</span></li>)}

        {row.right ? smallComponentPinouts[row.right].map(
          label => <li><span className='pin-label'>{label}</span></li>
        ) : Array.from({length: 3}, () => <li><span className='pin-label'>&times;</span></li>)}
      </>}
    </ol>)}
  </section>
}

const PinoutColumn: FunctionComponent<{ column: number }> = ({ column }) => <section class='column column--pinout'>
  <Pinout column={column} location='top' />
  <Pinout column={column} location='bottom' />
</section>

export function App() {
  const {
    columns,
    addColumn,
    removeColumn,
    mode,
    toggleMode
  } = useSelectors(['columns', 'addColumn', 'removeColumn', 'mode', 'toggleMode'])

  return <>
    <section class="controls">
      {mode === 'panel' && <>
        <button onClick={addColumn} disabled={columns.length >= 8}>+</button>
        <button onClick={removeColumn} disabled={columns.length <= 1}>-</button>
      </>}
      <button onClick={toggleMode}>Switch to {mode === 'panel' ? 'pinout' : 'panel'}</button>
    </section>
    <main className='panel'>
      {columns.map((_,i) =>
        mode === 'panel' ? <PanelColumn key={i} column={i} /> : <PinoutColumn key={i} column={i} />
      )}
    </main>
  </>
}
