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

const componentImages: Partial<Record<SmallComponent | LargeComponent, string>> = {
  "jack-mono": jack,
  "jack-stereo": jack,
  potentiometer,
  encoder,
  trimmer,
  switch: sw,
  button
}

type SmallComponent =
  | "jack-mono"
  | "jack-stereo"
  | "switch"
  | "button"

type LargeComponent = "potentiometer" | "trimmer" | "encoder"

type RowComponents =
  | { type: 'large', centre: LargeComponent }
  | { type: 'small', left: SmallComponent | undefined, right: SmallComponent | undefined }

const Component: FunctionComponent<{ component: SmallComponent | LargeComponent }> = ({ component }) => <span className={`component component--${component}`}>
  <img src={componentImages[component]} alt={component} />
</span>

const Row = () => {
  const [components, setComponents] = useState<RowComponents | undefined>()

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
        { type: 'small', left: event.currentTarget.value as SmallComponent, right: undefined }
      )} />
      <ComponentSelect type='large' onChange={(event) => setComponents(
        { type: 'large', centre: event.currentTarget.value as LargeComponent }
      )} />
      <ComponentSelect type='small' onChange={(event) => setComponents(
        { type: 'small', right: event.currentTarget.value as SmallComponent, left: undefined }
      )} />
    </>}
  </div>
}

const Column: FunctionComponent<{}> = () => <section class='column'>
  <img src={panel} alt="" />

  <Row />
  <Row />
  <Row />
  <Row />
  <Row />
  <Row />
</section>

export function App() {
  const [columns, setColumns] = useState(1)

  return <>
    <section class="controls">
      <button onClick={() => setColumns(c => c + 1)} disabled={columns >= 8}>+</button>
      <button onClick={() => setColumns(c => c - 1)} disabled={columns <= 1}>-</button>
    </section>
    <main className='panel'>
      {Array.from({ length: columns }, (_,i) =>
        <Column key={i} />
      )}
    </main>
  </>
}
