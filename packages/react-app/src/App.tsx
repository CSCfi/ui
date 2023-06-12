import { useState, useRef } from 'react';
import {
  CButton,
  CCard,
  CCardActions,
  CCardContent,
  CCardTitle,
  CRadioGroup,
  CSelect,
  CToasts,
  defineCustomElements,
} from 'csc-ui-react';
import {
  CToastType,
  CToastMessage,
  CRadioGroupItem,
  CSelectItem,
} from '@cscfi/csc-ui';
import './App.css';

defineCustomElements();

function App() {
  const toastRef = useRef<HTMLCToastsElement>(null);
  const [fruit, setFruit] = useState<string>();
  const [quantity, setQuantity] = useState<string>();

  const fruits: CSelectItem[] = [
    { name: '🍌 Banana', value: 'banana' },
    { name: '🍍 Pineapple', value: 'pineapple' },
    { name: '🍏 Apple', value: 'apple' },
    { name: '🍊 Orange', value: 'orange' },
    { name: '🍐 Pear', value: 'pear' },
    { name: '🍋 Lemon', value: 'lemon' },
  ];

  const quantities: CRadioGroupItem[] = [
    { value: 'One', label: '1' },
    { value: 'Two', label: '2' },
    { value: 'Three', label: '3' },
    { value: 'Four', label: '4' },
    { value: 'Five', label: '5' },
  ];

  const onReset = () => {
    setFruit(undefined);
    setQuantity(undefined);
  };

  const onOrder = () => {
    const message: CToastMessage = {
      type: CToastType.Success,
      title: 'Order received',
      message: `${quantity} ${fruit}${quantity === 'One' ? '' : 's'} coming right up!`,
      duration: 3000,
    };

    toastRef.current?.addToast(message);

    onReset();
  };

  return (
    <div className="App">
      <CCard>
        <CCardTitle>Reactive fruits</CCardTitle>

        <CCardContent>
          <CSelect
            label="Select a fruit"
            value={fruit}
            items={fruits}
            onChangeValue={(e: CustomEvent) => setFruit(e.detail.value)}
            return-value
            hide-details
          />

          <CRadioGroup
            label="Select quantity"
            value={quantity}
            items={quantities}
            onChangeValue={(e: CustomEvent) => setQuantity(e.detail.value)}
            return-value
            hide-details
            inline
          />
        </CCardContent>

        <CCardActions justify="end">
          <CButton outlined onClick={onReset}>Reset</CButton>
          <CButton disabled={!fruit || !quantity } onClick={onOrder}>Order</CButton>
        </CCardActions>
      </CCard>

      <CToasts ref={toastRef}></CToasts>
    </div>
  );
}

export default App;
