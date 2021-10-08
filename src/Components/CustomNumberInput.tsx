import { Input, InputProps } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
type props = InputProps & {
  value?: number | undefined,
  onChange: (newValue: number | undefined) => void,
  disabled?: boolean
  float?: boolean,
  allowEmpty?: boolean,
}
export default function CustomNumberInput({ value, onChange, disabled = false, float = false, ...props }: props) {
  const [state, setState] = useState("")
  const sendChange = useCallback(
    () => {
      if (state === "") return onChange(0)
      const parseFunc = float ? parseFloat : parseInt
      onChange(parseFunc(state))
    },
    [onChange, state, float],
  )
  useEffect(() => setState(value?.toString() ?? ""), [value, setState]) // update value on value change

  return <Input
    value={state}
    aria-label="custom-input"
    type="number"
    onChange={(e: any) => setState(e.target.value)}
    onBlur={sendChange}
    disabled={disabled}
    onKeyDown={(e: any) => e.key === "Enter" && sendChange()}
    {...props}
  />
}