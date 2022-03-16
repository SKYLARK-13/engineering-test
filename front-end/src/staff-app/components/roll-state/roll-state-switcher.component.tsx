import React, { useState,useEffect } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"
import { useAppState } from "StateProvider"
interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void
  id:any
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, id }) => {
  const [rollState, setRollState] = useState(initialState)
  const { setRollStateArr } = useAppState()

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    setRollState(next)
    updateRollState(next)
    if (onStateChange) {
      onStateChange(next)
    }
  }

  const updateRollState = (next: any) => {
    setRollStateArr((prevRoll: any) => {
      let result: any = []
      for (let i = 0; i < prevRoll.length; i++) {
        if (prevRoll[i].student_id === id) {
          result.push({
            student_id: prevRoll[i].student_id,
            roll_state: next,
          })
        } else {
          result.push(prevRoll[i])
        }
      }
      return result
    })
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
