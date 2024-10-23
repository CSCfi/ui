import { useState } from 'react'
import './App.css';
import { CButton, COption, CSelect, CSwitch, CCheckbox, CCard, CCardTitle, CCardContent, CCardActions, CSlider, CTag } from '@cscfi/csc-ui-for-react';
import { CSelectItem } from '../../csc-ui/dist/types/types';

function App() {
  const [count, setCount] = useState(0);
  const [isSelected, setIsSelected] = useState(false);
  const [sliderValue, setSliderValue] = useState(25);

  const [user, setUser] = useState<CSelectItem>({ name: 'Julle', value: 'julle' });

  return (
    <>
      <div style={{display: 'grid', gap: '1rem'}}>
        <pre>Current user: name - {user.name}, value - {user.value}</pre>
        <pre>Is selected: {isSelected ? 'True' : 'False'}</pre>

        <CCheckbox value={isSelected} onChangeValue={(event: CustomEvent<boolean>) => setIsSelected(event.detail)}>is aappina</CCheckbox>

        <CSwitch value={isSelected} onChangeValue={(event: CustomEvent<boolean>) => setIsSelected(event.detail)}>is aappina</CSwitch>

        <CButton onClick={() => setUser({ name: 'Jason', value: 'jason' })}>{user.name}</CButton>

        <CSelect label="User" value={user} onChangeValue={(event: CustomEvent<CSelectItem>) => setUser(event.detail)} return-object>
          <COption name="Jones" value="jones">Jones</COption>
          <COption name="Erik" value="erik">Erik</COption>
          <COption name="Mary" value="mary">Mary</COption>
          <COption name="Bill" value="bill">Bill</COption>
          <COption name="Leah" value="leah">Leah</COption>
        </CSelect>
      </div>

      <CCard className="card">
        <CCardTitle>Vite + React</CCardTitle>

        <CCardContent>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>

          <CSlider
            value={sliderValue}
            onChangeValue={(event: CustomEvent<number>) => setSliderValue(event.detail)}
            label="Monthly cost"
            max="1000"
            step="10"
            unit="€"
            ticks
            labels
          ></CSlider>

          <div>
            <CTag active flat badge="Monthly cost">{sliderValue} €</CTag>
          </div>
        </CCardContent>

        <CCardActions>
          <CButton disabled={count === 0} onClick={() => count > 0 && setCount((count) => count - 1)} ghost>
            Decrease
          </CButton>

          count is {count}

          <CButton onClick={() => setCount((count) => count + 1)} ghost>
            Increase
          </CButton>
        </CCardActions>

      </CCard>
    </>
  )
}

export default App
